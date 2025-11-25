"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createDeck, updateDeck, deleteDeck, getUserDeckCount } from "@/db/queries"

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
})

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
})

// ============================================
// SERVER ACTIONS
// ============================================

type CreateDeckInput = z.infer<typeof createDeckSchema>

export async function createDeckAction(input: CreateDeckInput) {
  const { userId, has } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const validated = createDeckSchema.parse(input)

  // Check if user has unlimited decks feature (Pro plan)
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" })

  if (!hasUnlimitedDecks) {
    // Check deck count limit for free plan users
    const deckCount = await getUserDeckCount(userId)
    const has3DecksLimit = has({ feature: "3_decks_limit" })

    if (has3DecksLimit && deckCount >= 3) {
      throw new Error(
        "You've reached the maximum of 3 decks. Upgrade to Pro for unlimited decks."
      )
    }
  }

  // Use query helper to create
  const newDeck = await createDeck(userId, validated)

  revalidatePath("/dashboard")
  revalidatePath("/decks")

  return newDeck
}

type UpdateDeckInput = z.infer<typeof updateDeckSchema>

export async function updateDeckAction(input: UpdateDeckInput) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const validated = updateDeckSchema.parse(input)

  // Query helper handles ownership verification
  const updatedDeck = await updateDeck(userId, validated.deckId, {
    name: validated.name,
    description: validated.description,
  })

  revalidatePath("/dashboard")
  revalidatePath("/decks")
  revalidatePath(`/decks/${validated.deckId}`)

  return updatedDeck
}

export async function deleteDeckAction(deckId: number) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Query helper handles ownership verification
  await deleteDeck(userId, deckId)

  revalidatePath("/dashboard")
  revalidatePath("/decks")

  return { success: true }
}

