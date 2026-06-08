import 'dotenv/config';
import bcrypt from 'bcrypt';
import {PrismaClient, UserRole} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername) throw new Error('ADMIN_USERNAME is required');
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  await prisma.user.upsert({
    where: {email: adminUsername},
    update: {
      password: await bcrypt.hash(adminPassword, 10),
      name: 'Administrator',
      avatar: 'https://i.pravatar.cc/200?u=admin',
      role: UserRole.ADMIN,
    },
    create: {
      email: adminUsername,
      password: await bcrypt.hash(adminPassword, 10),
      name: 'Administrator',
      avatar: 'https://i.pravatar.cc/200?u=admin',
      role: UserRole.ADMIN,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log(`Admin account is ready: ${process.env.ADMIN_USERNAME}`);
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
