import { db } from "@/db"
import { cardsTable, decksTable } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { getUserDeckById } from "./decks"

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all cards for a specific deck, with ownership verification
 * Ordered by most recently updated first
 */
export async function getDeckCards(userId: string, deckId: number) {
  // Verify user owns the deck
  const deck = await getUserDeckById(userId, deckId)
  if (!deck) {
    throw new Error("Deck not found or access denied")
  }

  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt))
}

/**
 * Get a specific card by ID, with ownership verification
 * Returns null if card doesn't exist or user doesn't own it
 */
export async function getCardById(userId: string, cardId: number) {
  const [result] = await db
    .select({
      card: cardsTable,
      deck: decksTable,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(
      and(
        eq(cardsTable.id, cardId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1)

  return result ?? null
}

/**
 * Get a random card from a deck for study purposes
 */
export async function getRandomCardFromDeck(userId: string, deckId: number) {
  const cards = await getDeckCards(userId, deckId)
  
  if (cards.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * cards.length)
  return cards[randomIndex]
}

// ============================================
// WRITE OPERATIONS
// ============================================

/**
 * Create a new card in a deck, with ownership verification
 */
export async function createCard(
  userId: string,
  deckId: number,
  data: { front: string; back: string }
) {
  // Verify user owns the deck
  const deck = await getUserDeckById(userId, deckId)
  if (!deck) {
    throw new Error("Deck not found or access denied")
  }

  const [newCard] = await db
    .insert(cardsTable)
    .values({
      deckId,
      front: data.front,
      back: data.back,
    })
    .returning()

  // Update deck's updatedAt timestamp
  await db
    .update(decksTable)
    .set({ updatedAt: new Date() })
    .where(eq(decksTable.id, deckId))

  return newCard
}

/**
 * Update a card, with ownership verification
 */
export async function updateCard(
  userId: string,
  cardId: number,
  data: { front?: string; back?: string }
) {
  // Verify user owns the card (through deck ownership)
  const result = await getCardById(userId, cardId)
  if (!result) {
    throw new Error("Card not found or access denied")
  }

  const [updatedCard] = await db
    .update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cardId))
    .returning()

  // Update deck's updatedAt timestamp
  await db
    .update(decksTable)
    .set({ updatedAt: new Date() })
    .where(eq(decksTable.id, result.deck.id))

  return updatedCard
}

/**
 * Delete a card, with ownership verification
 */
export async function deleteCard(userId: string, cardId: number) {
  // Verify user owns the card (through deck ownership)
  const result = await getCardById(userId, cardId)
  if (!result) {
    throw new Error("Card not found or access denied")
  }

  await db.delete(cardsTable).where(eq(cardsTable.id, cardId))

  // Update deck's updatedAt timestamp
  await db
    .update(decksTable)
    .set({ updatedAt: new Date() })
    .where(eq(decksTable.id, result.deck.id))

  return { success: true }
}

/**
 * Bulk create multiple cards in a deck
 */
export async function createManyCards(
  userId: string,
  deckId: number,
  cards: Array<{ front: string; back: string }>
) {
  // Verify user owns the deck
  const deck = await getUserDeckById(userId, deckId)
  if (!deck) {
    throw new Error("Deck not found or access denied")
  }

  if (cards.length === 0) {
    return []
  }

  const newCards = await db
    .insert(cardsTable)
    .values(
      cards.map((card) => ({
        deckId,
        front: card.front,
        back: card.back,
      }))
    )
    .returning()

  // Update deck's updatedAt timestamp
  await db
    .update(decksTable)
    .set({ updatedAt: new Date() })
    .where(eq(decksTable.id, deckId))

  return newCards
}

