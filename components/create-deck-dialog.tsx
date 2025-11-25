"use client"

import { useState, useEffect } from "react"
import { createDeckAction } from "@/app/actions/deck-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"

interface CreateDeckDialogProps {
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  disabled?: boolean
}

export function CreateDeckDialog({
  variant = "default",
  size = "lg",
  showIcon = true,
  disabled = false,
}: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only rendering Dialog after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    try {
      await createDeckAction({
        name,
        description: description || undefined,
      })

      toast.success("Deck created successfully!")
      setOpen(false)
      // Reset form
      e.currentTarget.reset()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create deck"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show button immediately, but only enable dialog functionality after mount
  if (!isMounted) {
    return (
      <Button variant={variant} size={size} disabled={true}>
        {showIcon && <PlusCircle className="mr-2 h-5 w-5" />}
        {size === "lg" ? "Create Deck" : "Create Your First Deck"}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled} suppressHydrationWarning>
          {showIcon && <PlusCircle className="mr-2 h-5 w-5" />}
          {size === "lg" ? "Create Deck" : "Create Your First Deck"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Create a new flashcard deck. Give it a name and an optional
              description to help you organize your learning materials.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deck-name">Deck Name</Label>
              <Input
                id="deck-name"
                name="name"
                placeholder="e.g., Spanish Vocabulary, React Hooks, History Facts..."
                required
                disabled={isLoading}
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deck-description">
                Description (Optional)
              </Label>
              <Textarea
                id="deck-description"
                name="description"
                placeholder="What is this deck about? What will you be studying?"
                rows={3}
                disabled={isLoading}
                maxLength={500}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

