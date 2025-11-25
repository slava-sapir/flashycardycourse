"use client";

import { SignIn, SignUp, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="text-xl font-bold">Learning Flash Cards</div>
      <div className="flex gap-4 items-center">
        <SignedOut>
          {/* Sign In Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button suppressHydrationWarning>Sign In</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <VisuallyHidden>
                <DialogTitle>Sign In</DialogTitle>
              </VisuallyHidden>
              <SignIn routing="hash" />
            </DialogContent>
          </Dialog>

          {/* Sign Up Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" suppressHydrationWarning>Sign Up</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <VisuallyHidden>
                <DialogTitle>Sign Up</DialogTitle>
              </VisuallyHidden>
              <SignUp routing="hash" />
            </DialogContent>
          </Dialog>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

