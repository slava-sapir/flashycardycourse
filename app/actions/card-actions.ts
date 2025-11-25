"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createCard, updateCard, deleteCard } from "@/db/queries"

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
})

const updateCardSchema = z.object({
  cardId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
})

// ============================================
// SERVER ACTIONS
// ============================================

type CreateCardInput = z.infer<typeof createCardSchema>

export async function createCardAction(input: CreateCardInput) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const validated = createCardSchema.parse(input)

  // Query helper verifies deck ownership
  const newCard = await createCard(userId, validated.deckId, {
    front: validated.front,
    back: validated.back,
  })

  revalidatePath(`/decks/${validated.deckId}`)

  return newCard
}

type UpdateCardInput = z.infer<typeof updateCardSchema>

export async function updateCardAction(input: UpdateCardInput) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const validated = updateCardSchema.parse(input)

  // Query helper verifies card ownership
  const updatedCard = await updateCard(userId, validated.cardId, {
    front: validated.front,
    back: validated.back,
  })

  revalidatePath(`/decks/${updatedCard.deckId}`)

  return updatedCard
}

export async function deleteCardAction(cardId: number, deckId: number) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Query helper verifies card ownership
  await deleteCard(userId, cardId)

  revalidatePath(`/decks/${deckId}`)

  return { success: true }
}
