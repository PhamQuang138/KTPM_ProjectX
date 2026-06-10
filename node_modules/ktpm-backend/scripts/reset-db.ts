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
  // Clean all app data. Child tables are deleted first to satisfy FK constraints.
  await prisma.passwordResetToken.deleteMany();
  await prisma.userFollow.deleteMany();
  await prisma.userRating.deleteMany();
  await prisma.postShare.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.image.deleteMany();
  await prisma.vehicleListing.deleteMany();
  await prisma.garageVehicle.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.post.deleteMany();
  await prisma.article.deleteMany();
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
