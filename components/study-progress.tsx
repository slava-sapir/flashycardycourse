"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, StopCircle } from "lucide-react"

interface StudyProgressProps {
  totalCards: number
}

export function StudyProgress({ totalCards }: StudyProgressProps) {
  const [isStudying, setIsStudying] = useState(false)
  const [cardsStudied, setCardsStudied] = useState(0)

  const progress = totalCards > 0 ? (cardsStudied / totalCards) * 100 : 0

  function handleStartStudy() {
    if (totalCards === 0) return
    setIsStudying(true)
    setCardsStudied(0)
  }

  function handleStopStudy() {
    setIsStudying(false)
    setCardsStudied(0)
  }

  function handleNextCard() {
    if (cardsStudied < totalCards) {
      setCardsStudied((prev) => prev + 1)
    }
    if (cardsStudied + 1 >= totalCards) {
      // Study session complete
      setTimeout(() => {
        setIsStudying(false)
        setCardsStudied(0)
      }, 1000)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {isStudying ? (
        <>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress: {cardsStudied} / {totalCards}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextCard}
            disabled={cardsStudied >= totalCards}
          >
            Next Card
          </Button>
          <Button variant="outline" size="sm" onClick={handleStopStudy}>
            <StopCircle className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </>
      ) : (
        <Button
          onClick={handleStartStudy}
          disabled={totalCards === 0}
          variant="default"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Start Study Session
        </Button>
      )}
    </div>
  )
}

