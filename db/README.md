# Database Setup with Drizzle ORM

This project uses Drizzle ORM with a Neon Postgres database.

## Project Structure

```
├── db/
│   ├── schema.ts       # Database schema definitions
│   ├── index.ts        # Database connection
│   └── README.md       # This file
├── drizzle/            # Generated migration files (gitignored)
├── scripts/
│   └── test-db.ts      # Test script for database connection
├── drizzle.config.ts   # Drizzle Kit configuration
└── .env                # Environment variables (gitignored)
```

## Environment Setup

Make sure your `.env` file contains:

```env
DATABASE_URL=your_neon_connection_string
```

## Available Scripts

- `npm run db:push` - Push schema changes to database (quick for development)
- `npm run db:generate` - Generate SQL migration files
- `npm run db:migrate` - Apply migration files to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:test` - Run test script to verify connection

## Using the Database in Your Next.js App

### In Server Components (default)

```typescript
import { db } from '@/db';
import { usersTable } from '@/db/schema';

export default async function Page() {
  const users = await db.select().from(usersTable);
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### In API Routes

```typescript
// app/api/users/route.ts
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.select().from(usersTable);
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newUser = await db.insert(usersTable).values(body).returning();
  return NextResponse.json(newUser);
}
```

### In Server Actions

```typescript
'use server'

import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const age = parseInt(formData.get('age') as string);

  await db.insert(usersTable).values({ name, email, age });
  revalidatePath('/users');
}
```

## Common Drizzle Operations

### Select

```typescript
// Get all users
const users = await db.select().from(usersTable);

// Get specific columns
const names = await db
  .select({ name: usersTable.name })
  .from(usersTable);

// With conditions
import { eq } from 'drizzle-orm';
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id, 1));
```

### Insert

```typescript
// Single insert
await db.insert(usersTable).values({
  name: 'John',
  age: 30,
  email: 'john@example.com',
});

// Multiple inserts
await db.insert(usersTable).values([
  { name: 'John', age: 30, email: 'john@example.com' },
  { name: 'Jane', age: 25, email: 'jane@example.com' },
]);

// With return
const [newUser] = await db
  .insert(usersTable)
  .values({ name: 'John', age: 30, email: 'john@example.com' })
  .returning();
```

### Update

```typescript
import { eq } from 'drizzle-orm';

await db
  .update(usersTable)
  .set({ age: 31 })
  .where(eq(usersTable.id, 1));
```

### Delete

```typescript
import { eq } from 'drizzle-orm';

await db
  .delete(usersTable)
  .where(eq(usersTable.id, 1));
```

## Development Workflow

1. **Modify schema** in `db/schema.ts`
2. **Push changes** with `npm run db:push` (for development)
   - OR generate migrations with `npm run db:generate` then apply with `npm run db:migrate` (for production)
3. **Use the schema** in your Next.js app by importing from `@/db` and `@/db/schema`

## Drizzle Studio

To visually browse and edit your database:

```bash
npm run db:studio
```

This will open a web interface where you can view and edit your data.

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle with Neon Guide](https://orm.drizzle.team/docs/get-started-postgresql#neon)
- [Neon Documentation](https://neon.tech/docs)

