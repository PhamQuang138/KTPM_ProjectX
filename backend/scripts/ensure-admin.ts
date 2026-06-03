import 'dotenv/config';
import bcrypt from 'bcrypt';
import {PrismaClient, UserRole} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/carhub?schema=public',
  }),
});

async function main() {
  await prisma.user.upsert({
    where: {email: 'admin'},
    update: {
      password: await bcrypt.hash('12345', 10),
      name: 'Administrator',
      avatar: 'https://i.pravatar.cc/200?u=admin',
      role: UserRole.ADMIN,
    },
    create: {
      email: 'admin',
      password: await bcrypt.hash('12345', 10),
      name: 'Administrator',
      avatar: 'https://i.pravatar.cc/200?u=admin',
      role: UserRole.ADMIN,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Admin account is ready: admin / 12345');
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
