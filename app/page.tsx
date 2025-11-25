import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth-buttons";

export default async function Home() {
  // Redirect logged-in users to dashboard
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Learning Flash cards made easy
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal learning, flashcard platform
          </p>
        </div>
        <AuthButtons />
      </main>
    </div>
  );
}
