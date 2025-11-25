import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground">
          Select the perfect plan for your flashcard learning journey
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          All plans include secure data storage and automatic cross-device synchronization
        </p>
      </div>
      
      <div className="mx-auto max-w-5xl">
        <PricingTable />
      </div>
    </div>
  )
}

