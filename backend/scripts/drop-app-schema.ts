import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/carhub?schema=public',
  }),
});

async function main() {
  // Destructive reset for local development only.
  // This drops the app-owned tables and enum so the initial migration can recreate them cleanly.
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "images" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "vehicles" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "posts" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "users" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "PostStatus" CASCADE;');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('App database schema has been dropped.');
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
