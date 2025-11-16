"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="text-xl font-bold">Flashy Cardy Course</div>
      <div className="flex gap-4 items-center">
        <SignedOut>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="outline">Sign Up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

