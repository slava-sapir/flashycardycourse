import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { decksTable, cardsTable } from '../db/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Testing database connection...\n');

    // Create a test deck
    const deck: typeof decksTable.$inferInsert = {
      userId: 'test_user_id',
      name: 'Test Deck',
      description: 'A test deck for database connection',
    };

    const [newDeck] = await db.insert(decksTable).values(deck).returning();
    console.log('✓ New deck created!', newDeck);

    // Read all decks
    const decks = await db.select().from(decksTable);
    console.log('✓ Getting all decks from the database:', decks);

    // Create a test card
    if (newDeck) {
      const card: typeof cardsTable.$inferInsert = {
        deckId: newDeck.id,
        front: 'Test Question',
        back: 'Test Answer',
      };

      const [newCard] = await db.insert(cardsTable).values(card).returning();
      console.log('✓ New card created!', newCard);

      // Read all cards
      const cards = await db.select().from(cardsTable);
      console.log('✓ Getting all cards from the database:', cards);

      // Delete test data
      await db.delete(decksTable).where(eq(decksTable.id, newDeck.id));
      console.log('✓ Test deck and cards deleted (cascade)!');
    }

    console.log('\n✅ Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

main();

