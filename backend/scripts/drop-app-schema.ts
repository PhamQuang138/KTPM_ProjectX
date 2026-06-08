import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

async function main() {
  // Destructive reset for local development only.
  // This drops the app-owned tables and enum so the initial migration can recreate them cleanly.
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "password_reset_tokens" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "user_follows" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "user_ratings" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "post_shares" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "post_comments" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "post_likes" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "images" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "vehicle_listings" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "garage_vehicles" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "vehicles" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "posts" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "users" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "PostStatus" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "UserRole" CASCADE;');
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
