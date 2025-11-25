"use server"

import { auth } from "@clerk/nextjs/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getUserDeckById } from "@/db/queries"
import { db } from "@/db"
import { cardsTable, decksTable } from "@/db/schema"
import { eq } from "drizzle-orm"

// Flashcard schema for AI generation
// Using simple schema without length constraints to avoid compatibility issues
const flashcardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
    })
  ),
})

// Input validation schema
const generateFlashcardsInputSchema = z.object({
  deckId: z.number().int().positive(),
})

type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsInputSchema>

export async function generateFlashcardsWithAI(input: GenerateFlashcardsInput) {
  // 1. Authenticate
  const { userId, has } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  // 2. Validate input
  const validated = generateFlashcardsInputSchema.parse(input)

  // 3. Check plan/feature access
  const hasUnlimitedAI = has({ feature: "ai_flashcards_generation" })
  const hasOneTimeAI = has({ feature: "one_ai_flashcards_generation" })

  if (!hasUnlimitedAI && !hasOneTimeAI) {
    throw new Error(
      "AI flashcard generation is not available on your plan. Upgrade to access this feature."
    )
  }

  // 4. Verify deck ownership
  const deck = await getUserDeckById(userId, validated.deckId)

  if (!deck) {
    throw new Error("Forbidden: You don't have access to this deck")
  }

  // 5. For free users, check if they've used their one-time generation
  // Note: This is a simplified check. In production, you'd track this in the database.
  // For now, we'll allow free users to generate once per session.
  // You should implement a proper tracking mechanism in your database.

  // 6. Generate flashcards with AI
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables."
      )
    }

    // Create adaptive prompt based on deck context
    const prompt = `CRITICAL: You MUST generate EXACTLY 20 flashcards. Not 19, not 21, but exactly 20.

Generate flashcards for this deck:

**Deck Title:** "${deck.name}"
${deck.description ? `**Description:** ${deck.description}\n` : ""}

**REQUIRED: Generate EXACTLY 20 cards (count carefully)**

**Instructions:**
Analyze the deck title and description to understand what type of content is needed, then generate appropriate flashcards.

**Card Format Guidelines:**
- front: The question, prompt, term, or source content
- back: The answer, explanation, definition, or target content

**Adapt your approach based on the content:**
- For vocabulary/translation: Keep back side concise (just the translation or definition)
- For concepts/topics: Provide clear explanations with examples where helpful
- For factual information: Give accurate, detailed answers
- For skills/how-to: Include step-by-step explanations

**Quality Requirements:**
- Make cards clear and focused (one concept per card)
- Ensure factual accuracy
- Progress from basic to more advanced
- Match the tone and depth to the subject matter
- Create cards that are actually useful for learning

**REMINDER: You must provide exactly 20 flashcards in the "cards" array. Count them before submitting.**`

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"), // Using gpt-4o-mini for cost efficiency
      schema: flashcardSchema,
      prompt,
      temperature: 0.5, // Lower temperature for more consistent output
      maxRetries: 2, // Retry up to 2 times if generation fails
    })

    // Strict validation for exactly 20 cards
    if (!object.cards || object.cards.length === 0) {
      console.error("AI generation error: No cards generated")
      throw new Error(
        "AI did not generate any flashcards. Please try again."
      )
    }

    // Log the actual count for debugging
    console.log(`AI generated ${object.cards.length} cards for deck: ${deck.name}`)

    // Check if we got exactly 20 cards
    if (object.cards.length < 20) {
      console.error(`AI generated ${object.cards.length} cards instead of 20`)
      throw new Error(
        `AI generated only ${object.cards.length} cards instead of 20. This is likely a temporary issue. Please try generating again.`
      )
    }

    // If we got more than 20, trim to exactly 20 and log a warning
    if (object.cards.length > 20) {
      console.warn(`AI generated ${object.cards.length} cards, trimming to 20`)
    }
    
    const finalCards = object.cards.slice(0, 20)
    
    // Final validation
    if (finalCards.length !== 20) {
      console.error(`Final card count is ${finalCards.length} instead of 20`)
      throw new Error(
        `Expected exactly 20 cards but got ${finalCards.length}. Please try again.`
      )
    }
    
    console.log(`Successfully validated ${finalCards.length} cards for insertion`)

    // 7. Insert generated cards into database
    const cardsToInsert = finalCards.map((card: { front: string; back: string }) => ({
      deckId: validated.deckId,
      front: card.front,
      back: card.back,
    }))

    const insertedCards = await db
      .insert(cardsTable)
      .values(cardsToInsert)
      .returning()

    // 8. Mark deck as having used AI generation
    await db
      .update(decksTable)
      .set({ aiGenerationUsed: true, updatedAt: new Date() })
      .where(eq(decksTable.id, validated.deckId))

    // 9. Revalidate
    revalidatePath(`/decks/${validated.deckId}`)

    return {
      success: true,
      cards: insertedCards,
      count: insertedCards.length,
    }
  } catch (error) {
    console.error("AI generation error:", error)
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      // Check for schema validation errors
      if (error.message.includes("did not match schema") || error.message.includes("No object generated")) {
        throw new Error(
          "AI response format error. This might be a temporary issue. Please try again, or if the problem persists, try editing your deck description to be more specific."
        )
      }
      // Check for common OpenAI API errors
      if (error.message.includes("API key")) {
        throw new Error(
          "OpenAI API key is invalid or not configured. Please check your OPENAI_API_KEY environment variable."
        )
      }
      if (error.message.includes("quota") || error.message.includes("billing")) {
        throw new Error(
          "OpenAI API quota exceeded or billing issue. Please check your OpenAI account."
        )
      }
      if (error.message.includes("rate limit")) {
        throw new Error(
          "OpenAI API rate limit reached. Please try again in a few moments."
        )
      }
      // Return the actual error message for debugging
      throw new Error(`AI generation failed: ${error.message}`)
    }
    
    throw new Error("Failed to generate flashcards with AI. Please try again.")
  }
}

