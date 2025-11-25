"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { generateFlashcardsWithAI } from "@/app/actions/ai-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface GenerateAICardsButtonProps {
  deckId: number
  hasAIAccess: boolean
  disabled?: boolean
  disabledReason?: string
}

export function GenerateAICardsButton({
  deckId,
  hasAIAccess,
  disabled = false,
  disabledReason,
}: GenerateAICardsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  async function handleGenerate() {
    if (!hasAIAccess) {
      // Redirect to pricing page
      router.push("/pricing")
      return
    }

    if (disabled) {
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateFlashcardsWithAI({ deckId })

      toast.success(`Successfully generated ${result.count} flashcards!`)
      
      // Force a full page reload to refresh server component data
      window.location.reload()
    } catch (error) {
      console.error("Failed to generate flashcards:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate flashcards. Please try again."
      )
      setIsGenerating(false)
    }
  }

  const isDisabled = isGenerating || disabled

  // If disabled due to missing description, show tooltip
  if (disabled && disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                disabled={true}
                variant="default"
                size="lg"
                className="pointer-events-none"
              >
                ✨ Generate 20 Cards with AI
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // If user has access, show a button with tooltip
  if (hasAIAccess) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleGenerate}
              disabled={isDisabled}
              variant="default"
              size="lg"
            >
              {isGenerating ? "Generating..." : "✨ Generate 20 Cards with AI"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              {isGenerating
                ? "Generating flashcards with AI..."
                : "Automatically generate 20 flashcards based on your deck's title and description"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // If user doesn't have access, show button with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleGenerate}
            variant="outline"
            size="lg"
            className="border-dashed"
          >
            ✨ Generate 20 Cards with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">
            This is a paid feature. Click to view pricing and upgrade to
            generate unlimited flashcards with AI.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

