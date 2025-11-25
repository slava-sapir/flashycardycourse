import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { getUserDeckById, getDeckCards } from "@/db/queries"
import { Button } from "@/components/ui/button"
import { StudyFlashcard } from "@/components/study-flashcard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  // 1. Authenticate user
  const { userId } = await auth()
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

  // 5. Check if there are cards to study
  if (cards.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Link href={`/decks/${deckIdNumber}`}>
          <Button variant="outline" className="mb-4">
            ← Back to Deck
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>No Cards to Study</CardTitle>
            <CardDescription>
              This deck doesn&apos;t have any cards yet. Add some cards to start
              studying!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/decks/${deckIdNumber}`}>
              <Button>Go to Deck</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href={`/decks/${deckIdNumber}`}>
        <Button variant="outline" className="mb-4">
          ← Back to Deck
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{deck.name}</h1>
        {deck.description && (
          <p className="text-muted-foreground mt-2">{deck.description}</p>
        )}
      </div>

      <StudyFlashcard cards={cards} deckName={deck.name} />
    </div>
  )
}

