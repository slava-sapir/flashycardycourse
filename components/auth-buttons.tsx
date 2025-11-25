"use client"

import { SignIn, SignUp } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

export function AuthButtons() {
  return (
    <div className="flex gap-4" suppressHydrationWarning>
      {/* Sign In Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" suppressHydrationWarning>Sign In</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <VisuallyHidden>
            <DialogTitle>Sign In</DialogTitle>
          </VisuallyHidden>
          <SignIn 
            routing="hash"
            forceRedirectUrl="/dashboard"
            signUpUrl="#sign-up"
          />
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" variant="outline" suppressHydrationWarning>
            Sign Up
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <VisuallyHidden>
            <DialogTitle>Sign Up</DialogTitle>
          </VisuallyHidden>
          <SignUp 
            routing="hash"
            forceRedirectUrl="/dashboard"
            signInUrl="#sign-in"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

