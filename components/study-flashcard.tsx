"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shuffle } from "lucide-react"

type CardType = {
  id: number
  front: string
  back: string
  deckId: number
  createdAt: Date
  updatedAt: Date | null
}

type CardResult = {
  cardId: number
  correct: boolean
}

interface StudyFlashcardProps {
  cards: CardType[]
  deckName: string
}

export function StudyFlashcard({ cards, deckName }: StudyFlashcardProps) {
  const [shuffledCards, setShuffledCards] = useState<CardType[]>(cards)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [results, setResults] = useState<CardResult[]>([])
  const [isStudyComplete, setIsStudyComplete] = useState(false)

  const currentCard = shuffledCards[currentCardIndex]
  const correctCount = results.filter((r) => r.correct).length
  const incorrectCount = results.filter((r) => !r.correct).length
  const progress = (results.length / shuffledCards.length) * 100
  const isLastCard = currentCardIndex === shuffledCards.length - 1

  const handleFlip = useCallback(() => {
    setIsFlipped(true)
  }, [])

  const handleAnswer = useCallback((correct: boolean) => {
    // Record the result
    const newResult: CardResult = {
      cardId: currentCard.id,
      correct,
    }
    setResults((prev) => [...prev, newResult])

    // Move to next card or finish
    if (isLastCard) {
      setIsStudyComplete(true)
    } else {
      setCurrentCardIndex((prev) => prev + 1)
      setIsFlipped(false)
    }
  }, [currentCard.id, isLastCard])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events if study is complete
      if (isStudyComplete) return

      switch (e.code) {
        case 'Space':
        case 'ArrowDown':
          // Prevent default spacebar scrolling
          e.preventDefault()
          if (!isFlipped) {
            handleFlip()
          }
          break
        case 'ArrowRight':
          // Navigate to next card
          if (currentCardIndex < shuffledCards.length - 1) {
            setCurrentCardIndex((prev) => prev + 1)
            setIsFlipped(false)
          }
          break
        case 'ArrowLeft':
          // Navigate to previous card
          if (currentCardIndex > 0) {
            setCurrentCardIndex((prev) => prev - 1)
            setIsFlipped(false)
          }
          break
        case 'Digit1':
        case 'Numpad1':
          // Mark as incorrect (only when flipped)
          if (isFlipped) {
            handleAnswer(false)
          }
          break
        case 'Digit2':
        case 'Numpad2':
          // Mark as correct (only when flipped)
          if (isFlipped) {
            handleAnswer(true)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, isStudyComplete, currentCardIndex, shuffledCards.length, handleFlip, handleAnswer])

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setResults([])
    setIsStudyComplete(false)
  }

  const handleShuffle = () => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...shuffledCards]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledCards(shuffled)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setResults([])
    setIsStudyComplete(false)
  }

  const handleReviewIncorrect = () => {
    // Get all incorrect card IDs
    const incorrectCardIds = results
      .filter((r) => !r.correct)
      .map((r) => r.cardId)

    // Find the index of the first incorrect card
    const firstIncorrectIndex = shuffledCards.findIndex((card) =>
      incorrectCardIds.includes(card.id)
    )

    if (firstIncorrectIndex !== -1) {
      setCurrentCardIndex(firstIncorrectIndex)
      setIsFlipped(false)
      setResults([])
      setIsStudyComplete(false)
    }
  }

  const accuracyRate = results.length > 0 
    ? Math.round((correctCount / results.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Study Progress</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {results.length} / {shuffledCards.length} answered
              </Badge>
              <Button onClick={handleShuffle} variant="ghost" size="sm" className="gap-1">
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">
                  Correct: <span className="font-semibold text-foreground">{correctCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground">
                  Incorrect: <span className="font-semibold text-foreground">{incorrectCount}</span>
                </span>
              </div>
            </div>
            {results.length > 0 && (
              <div className="font-semibold">
                Accuracy: {accuracyRate}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Section */}
      {isStudyComplete ? (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {correctCount === shuffledCards.length ? "🎉 Perfect Score!" : "📚 Study Complete!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg">
                You&apos;ve completed studying all {shuffledCards.length} cards in{" "}
                <span className="font-semibold">{deckName}</span>!
              </p>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="text-2xl font-bold">{results.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {correctCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900/20">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {incorrectCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <div className="text-3xl font-bold">{accuracyRate}%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <Button onClick={handleRestart} size="lg">
                Study Again
              </Button>
              <Button onClick={handleShuffle} variant="secondary" size="lg" className="gap-2">
                <Shuffle className="h-5 w-5" />
                Shuffle & Restart
              </Button>
              {incorrectCount > 0 && (
                <Button onClick={handleReviewIncorrect} variant="outline" size="lg">
                  Review Incorrect ({incorrectCount})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="min-h-[450px] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                Card {currentCardIndex + 1} of {shuffledCards.length}
              </Badge>
              <Badge variant={isFlipped ? "default" : "secondary"}>
                {isFlipped ? "Answer" : "Question"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            {/* 3D Flip Container */}
            <div 
              className="w-full h-full min-h-[250px] relative"
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative w-full h-full transition-transform duration-600 ease-in-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front of Card (Question) */}
                <div
                  className="absolute inset-0 flex items-center justify-center p-25 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 cursor-pointer"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  onClick={!isFlipped ? handleFlip : undefined}
                >
                  <p className="text-2xl text-center break-words">
                    {currentCard.front}
                  </p>
                </div>

                {/* Back of Card (Answer) */}
                <div
                  className="absolute inset-0 flex items-center justify-center p-25 rounded-lg border-2 border-primary bg-primary/5"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <p className="text-2xl text-center break-words">
                    {currentCard.back}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!isFlipped ? (
              <div className="w-full space-y-2">
                <Button onClick={handleFlip} className="w-full" size="lg">
                  Show Answer
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Click the card, press <kbd className="px-2 py-1 text-xs font-semibold bg-secondary rounded">Space</kbd> or <kbd className="px-2 py-1 text-xs font-semibold bg-secondary rounded">↓</kbd> to reveal
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Use <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-secondary rounded">←</kbd> <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-secondary rounded">→</kbd> to navigate cards
                </p>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <p className="text-sm font-medium text-center mb-2">
                  Did you get it correct?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    className="flex-1 h-12 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    size="lg"
                  >
                    ✗ Incorrect
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    ✓ Correct
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-secondary rounded">1</kbd> for incorrect or <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-secondary rounded">2</kbd> for correct
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{shuffledCards.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Answered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{results.length}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Correct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {correctCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incorrect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {incorrectCount}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

