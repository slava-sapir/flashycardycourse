import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDecks } from "@/db/queries";
import Link from "next/link";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { PlusCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  // Authenticate user
  const { userId, has } = await auth();
  if (!userId) {
    redirect("/");
  }

  // Fetch user's decks using helper function
  const decks = await getUserDecks(userId);

  // Check user's plan and features
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const has3DecksLimit = has({ feature: "3_decks_limit" });
  const isProUser = has({ plan: "pro" });

  // Calculate deck limit
  const deckCount = decks.length;
  const deckLimit = hasUnlimitedDecks ? null : 3;
  const isAtLimit = !hasUnlimitedDecks && has3DecksLimit && deckCount >= 3;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Plan Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          {isProUser && (
            <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown className="mr-1 h-3 w-3" />
              Pro
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAtLimit ? (
            <Button asChild variant="default" size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Link href="/pricing">
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Pro
              </Link>
            </Button>
          ) : (
            <CreateDeckDialog size="lg" disabled={isAtLimit} />
          )}
        </div>
      </div>

      {/* Plan Status Card - Free Plan Users */}
      {!hasUnlimitedDecks && has3DecksLimit && (
        <div className={`mb-8 rounded-lg border ${
          isAtLimit 
            ? 'border-destructive/50 bg-destructive/5' 
            : 'border-amber-500/30 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10'
        } p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-2 ${
                isAtLimit 
                  ? 'bg-destructive/10' 
                  : 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'
              }`}>
                <PlusCircle className={`h-5 w-5 ${
                  isAtLimit ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {isAtLimit ? 'Deck Limit Reached' : 'Free Plan'}
                  </h3>
                  <Badge variant="outline" className={
                    isAtLimit ? 'border-destructive/50 text-destructive' : ''
                  }>
                    {deckCount}/{deckLimit} decks used
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isAtLimit 
                    ? 'Upgrade to Pro for unlimited decks and AI-generated flashcard sets' 
                    : 'Upgrade to Pro for unlimited decks and more features'
                  }
                </p>
              </div>
            </div>
            <Button asChild variant={isAtLimit ? "default" : "outline"} className={
              isAtLimit 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                : 'border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/20'
            }>
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Pro Plan Status Card */}
      {hasUnlimitedDecks && isProUser && (
        <div className="mb-8 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-2">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Pro Plan</h3>
                <Badge variant="outline" className="border-amber-500/30">
                  Unlimited Decks
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                You have access to unlimited decks and AI-generated flashcard sets
              </p>
            </div>
          </div>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <PlusCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No decks yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get started by creating your first flashcard deck. Organize your
            learning materials and start studying!
          </p>
          <CreateDeckDialog size="lg" disabled={isAtLimit} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6 h-full">
                <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
                {deck.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {deck.description}
                  </p>
                )}
                <div className="mt-4 text-xs text-muted-foreground">
                  Updated {new Date(deck.updatedAt).toISOString().split('T')[0]}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

