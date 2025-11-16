import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { usersTable } from '../db/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Testing database connection...\n');

    // Create a new user
    const user: typeof usersTable.$inferInsert = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    };

    await db.insert(usersTable).values(user);
    console.log('✓ New user created!');

    // Read all users
    const users = await db.select().from(usersTable);
    console.log('✓ Getting all users from the database:', users);

    // Update user
    await db
      .update(usersTable)
      .set({ age: 31 })
      .where(eq(usersTable.email, user.email));
    console.log('✓ User info updated!');

    // Delete user
    await db.delete(usersTable).where(eq(usersTable.email, user.email));
    console.log('✓ User deleted!');

    console.log('\n✅ Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

main();

