import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/carhub?schema=public',
  }),
});

async function main() {
  // Clean all app data. Child tables are deleted first to satisfy FK constraints.
  await prisma.image.deleteMany();
  await prisma.vehicleListing.deleteMany();
  await prisma.garageVehicle.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Database data has been cleared.');
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
