import { db } from "@/db"
import { decksTable, cardsTable } from "@/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all decks for a specific user, ordered by most recently updated
 */
export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt))
}

/**
 * Get a specific deck by ID, ensuring user ownership
 * Returns null if deck doesn't exist or user doesn't own it
 */
export async function getUserDeckById(userId: string, deckId: number) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(
      and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      )
    )
    .limit(1)

  return deck ?? null
}

/**
 * Get deck with card count
 */
export async function getUserDeckWithCardCount(userId: string, deckId: number) {
  const deck = await getUserDeckById(userId, deckId)
  if (!deck) return null

  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))

  return {
    ...deck,
    cardCount: cards.length,
  }
}

/**
 * Get count of user's decks
 */
export async function getUserDeckCount(userId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(decksTable)
    .where(eq(decksTable.userId, userId))

  return result?.count ?? 0
}

// ============================================
// WRITE OPERATIONS
// ============================================

/**
 * Create a new deck for a user
 */
export async function createDeck(
  userId: string,
  data: { name: string; description?: string }
) {
  const [newDeck] = await db
    .insert(decksTable)
    .values({
      userId,
      name: data.name,
      description: data.description,
    })
    .returning()

  return newDeck
}

/**
 * Update a deck, with ownership verification
 * Throws error if user doesn't own the deck
 */
export async function updateDeck(
  userId: string,
  deckId: number,
  data: { name?: string; description?: string }
) {
  // Verify ownership first
  const deck = await getUserDeckById(userId, deckId)
  if (!deck) {
    throw new Error("Deck not found or access denied")
  }

  const [updatedDeck] = await db
    .update(decksTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(decksTable.id, deckId))
    .returning()

  return updatedDeck
}

/**
 * Delete a deck, with ownership verification
 * Throws error if user doesn't own the deck
 * Cascade delete will remove all cards in the deck
 */
export async function deleteDeck(userId: string, deckId: number) {
  // Verify ownership first
  const deck = await getUserDeckById(userId, deckId)
  if (!deck) {
    throw new Error("Deck not found or access denied")
  }

  // Delete deck (cascade will delete related cards)
  await db.delete(decksTable).where(eq(decksTable.id, deckId))

  return { success: true }
}

/**
 * Duplicate a deck with all its cards (atomic operation)
 */
export async function duplicateDeck(userId: string, deckId: number) {
  return await db.transaction(async (tx) => {
    // Verify ownership using regular helper
    const originalDeck = await getUserDeckById(userId, deckId)
    if (!originalDeck) {
      throw new Error("Deck not found or access denied")
    }

    // Create new deck
    const [newDeck] = await tx
      .insert(decksTable)
      .values({
        userId,
        name: `${originalDeck.name} (Copy)`,
        description: originalDeck.description,
      })
      .returning()

    // Get all cards from original deck
    const originalCards = await tx
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.deckId, deckId))

    // Copy all cards to new deck
    if (originalCards.length > 0) {
      await tx.insert(cardsTable).values(
        originalCards.map((card) => ({
          deckId: newDeck.id,
          front: card.front,
          back: card.back,
        }))
      )
    }

    return newDeck
  })
}

