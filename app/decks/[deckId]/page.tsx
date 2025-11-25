import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { getUserDeckById, getDeckCards } from "@/db/queries"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeckActions, CardActions, CreateCardButton } from "@/components/deck-actions"
import { InfiniteCardList } from "@/components/infinite-card-list"
import Link from "next/link"

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  // 1. Authenticate user and check features
  const { userId, has } = await auth()
  if (!userId) {
    redirect("/")
  }

  // 2. Parse deck ID
  const { deckId } = await params
  const deckIdNumber = parseInt(deckId, 10)

  if (isNaN(deckIdNumber)) {
    notFound()
  }

  // 3. Fetch deck with ownership verification
  const deck = await getUserDeckById(userId, deckIdNumber)
  if (!deck) {
    notFound()
  }

  // 4. Fetch cards for the deck
  const cards = await getDeckCards(userId, deckIdNumber)

  // 5. Check AI generation access
  const hasUnlimitedAI = has({ feature: "ai_flashcards_generation" })
  const hasOneTimeAI = has({ feature: "one_ai_flashcards_generation" })
  const hasAIAccess = hasUnlimitedAI || hasOneTimeAI
  
  // 6. Check if user is on free plan (for upgrade prompt)
  const isFreePlan = !hasUnlimitedAI
  
  // 7. Check if AI generation has already been used for this deck
  const canShowAIButton = hasAIAccess && !deck.aiGenerationUsed
  
  // 8. Check if deck has no description (required for AI generation)
  const hasNoDescription = !deck.description || deck.description.trim() === ""
  const aiButtonDisabledReason = hasNoDescription
    ? "AI generation requires a deck description. Please add a description to your deck to generate flashcards with AI."
    : undefined

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4">
            ← Back to Dashboard
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl">{deck.name}</CardTitle>
                {deck.description && (
                  <CardDescription className="text-base mt-2">
                    {deck.description}
                  </CardDescription>
                )}
              </div>
              <DeckActions
                deck={deck}
                cardCount={cards.length}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-sm">
                {cards.length} {cards.length === 1 ? "card" : "cards"}
              </Badge>
              <div>
                Created {new Date(deck.createdAt).toLocaleDateString()}
              </div>
              {deck.updatedAt && (
                <div>
                  Updated {new Date(deck.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {cards.length > 0 && (
              <div className="pt-4 border-t">
                <Link href={`/decks/${deckIdNumber}/study`} className="block">
                  <Button className="w-full" size="lg">
                    Start Studying
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {isFreePlan && (
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-semibold">
                    Upgrade to Pro
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Unlock Premium Features
                  </span>
                </div>
                <h3 className="text-lg font-semibold">
                  Generate unlimited flashcards with AI
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro to generate unlimited AI-powered flashcards, create unlimited decks, and supercharge your learning experience.
                </p>
                <ul className="text-sm space-y-1 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Unlimited AI flashcard generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Unlimited decks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <Link href="/pricing">
                  <Button size="lg" className="w-full md:w-auto">
                    View Plans →
                  </Button>
                </Link>
                {hasOneTimeAI && !deck.aiGenerationUsed && (
                  <p className="text-xs text-muted-foreground text-center md:text-right">
                    You have 1 free AI generation available
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Flashcards</h2>
          <CardActions
            deckId={deckIdNumber}
            canShowAIButton={canShowAIButton}
            hasAIAccess={hasAIAccess}
            hasNoDescription={hasNoDescription}
            aiButtonDisabledReason={aiButtonDisabledReason}
          />
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No cards in this deck yet
              </p>
              <CreateCardButton deckId={deckIdNumber} />
            </CardContent>
          </Card>
        ) : (
          <InfiniteCardList cards={cards} deckId={deckIdNumber} />
        )}
      </div>
    </div>
  )
}

