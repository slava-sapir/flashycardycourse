"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EditCardDialog } from "@/components/edit-card-dialog"
import { DeleteCardDialog } from "@/components/delete-card-dialog"

interface CardData {
  id: number
  deckId: number
  front: string
  back: string
  createdAt: Date
  updatedAt: Date | null
}

interface InfiniteCardListProps {
  cards: CardData[]
  deckId: number
}

const CARDS_PER_PAGE = 9 // 3 rows x 3 cards

export function InfiniteCardList({ cards, deckId }: InfiniteCardListProps) {
  // Initialize state with a function to avoid recalculation
  const [displayedCards, setDisplayedCards] = useState<CardData[]>(() => 
    cards.slice(0, CARDS_PER_PAGE)
  )
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(() => cards.length > CARDS_PER_PAGE)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Load more cards
  const loadMoreCards = useCallback(() => {
    const startIndex = page * CARDS_PER_PAGE
    const endIndex = startIndex + CARDS_PER_PAGE
    const newCards = cards.slice(startIndex, endIndex)

    if (newCards.length > 0) {
      setDisplayedCards((prev) => [...prev, ...newCards])
      setPage((prev) => prev + 1)
      setHasMore(endIndex < cards.length)
    } else {
      setHasMore(false)
    }
  }, [page, cards])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreCards()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadMoreCards])

  if (cards.length === 0) {
    return null
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedCards.map((card) => (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">Front</CardTitle>
                  <CardDescription className="text-base text-foreground mt-2">
                    {card.front}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <EditCardDialog card={card} />
                  <DeleteCardDialog
                    cardId={card.id}
                    deckId={deckId}
                    cardFront={card.front}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  Back
                </p>
                <p className="text-sm">{card.back}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Intersection observer target */}
      {hasMore && (
        <div ref={observerTarget} className="py-8 text-center">
          <div className="inline-block animate-pulse text-muted-foreground">
            Loading more cards...
          </div>
        </div>
      )}

      {!hasMore && displayedCards.length > 0 && (
        <div className="py-8 text-center text-muted-foreground">
          All cards loaded ({displayedCards.length} total)
        </div>
      )}
    </>
  )
}

