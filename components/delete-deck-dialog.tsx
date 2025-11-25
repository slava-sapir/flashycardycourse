"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteDeckAction } from "@/app/actions/deck-actions"
import { toast } from "sonner"

interface DeleteDeckDialogProps {
  deckId: number
  deckName: string
  cardCount: number
}

export function DeleteDeckDialog({
  deckId,
  deckName,
  cardCount,
}: DeleteDeckDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteDeckAction(deckId)
      toast.success("Deck deleted successfully")
      setOpen(false)
      // Redirect to dashboard after successful deletion
      router.push("/dashboard")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete deck"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          suppressHydrationWarning
        >
          <Trash2 className="h-4 w-4" />
          Delete Deck
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Deck</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className="mb-3">
                Are you sure you want to delete this deck? This action cannot be
                undone.
              </p>
              <div className="p-3 bg-muted rounded-md space-y-2">
                <div>
                  <span className="text-sm font-medium text-foreground block">
                    {deckName}
                  </span>
                </div>
                {cardCount > 0 && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-sm text-destructive font-semibold">
                      ⚠️ This will also delete {cardCount} {cardCount === 1 ? "card" : "cards"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Deck"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

