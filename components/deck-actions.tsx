"use client"

import { EditDeckDialog } from "@/components/edit-deck-dialog"
import { DeleteDeckDialog } from "@/components/delete-deck-dialog"
import { CreateCardDialog } from "@/components/create-card-dialog"
import { GenerateAICardsButton } from "@/components/generate-ai-cards-button"

interface DeckActionsProps {
  deck: {
    id: number
    userId: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date | null
    aiGenerationUsed: boolean
  }
  cardCount: number
}

export function DeckActions({
  deck,
  cardCount,
}: DeckActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <EditDeckDialog deck={deck} />
      <DeleteDeckDialog
        deckId={deck.id}
        deckName={deck.name}
        cardCount={cardCount}
      />
    </div>
  )
}

interface CardActionsProps {
  deckId: number
  canShowAIButton: boolean
  hasAIAccess: boolean
  hasNoDescription: boolean
  aiButtonDisabledReason?: string
}

export function CardActions({
  deckId,
  canShowAIButton,
  hasAIAccess,
  hasNoDescription,
  aiButtonDisabledReason,
}: CardActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {canShowAIButton && (
        <GenerateAICardsButton
          deckId={deckId}
          hasAIAccess={hasAIAccess}
          disabled={hasNoDescription}
          disabledReason={aiButtonDisabledReason}
        />
      )}
      <CreateCardDialog deckId={deckId} />
    </div>
  )
}

interface CreateCardButtonProps {
  deckId: number
}

export function CreateCardButton({ deckId }: CreateCardButtonProps) {
  return <CreateCardDialog deckId={deckId} />
}

