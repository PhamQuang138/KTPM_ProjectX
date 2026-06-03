import 'dotenv/config';
import bcrypt from 'bcrypt';
import {PostStatus, PrismaClient, UserRole} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/carhub?schema=public',
  }),
});

async function main() {
  // Seed starts from a clean state so local test data is deterministic.
  await prisma.image.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      password,
      name: 'Alex Rivera',
      avatar: 'https://i.pravatar.cc/200?u=alex-rivera',
      role: UserRole.USER,
    },
  });

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

  await prisma.post.create({
    data: {
      title: 'Restoration Notes From The Weekend',
      summary: 'A quick update on a classic GT restoration project.',
      content:
        'The final wheel fitment is complete, and the car finally sits exactly how I imagined it. Next up is a full detail before the first long road test.',
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200',
            publicId: 'seed/posts/restoration-911',
            caption: 'Classic sports car after restoration work.',
          },
          {
            url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200',
            publicId: 'seed/posts/restoration-detail',
            caption: 'Detail shot from the garage session.',
          },
        ],
      },
    },
  });

  await prisma.vehicle.create({
    data: {
      title: '1974 GT Heritage',
      price: '$185,000',
      location: 'Monaco',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA3aPfyF_LB1tLXUvYqyAtBUp6enYudj5bH7Qe99C9wbCQPS90x7VqFZl55LOjWQzfDB5t7jlU-cYMnRD5GADDqCyC68-g-V-dS69PYiYbJcEx1Y_UHc8D0tw-O8EuEto_SWXp-k485IOGW3K-oV9ws4nJiHq9G88KXfRas3QqB-cv_3iAgvwVwygChjILt-0LrzozC3g4Gh3Tfn9WE7VjBKlokl9LeUnL1nB9yoFr1gQMx3MMgyXrMQ2SXWdoJtbFc4Jl6Gt6ctA',
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA3aPfyF_LB1tLXUvYqyAtBUp6enYudj5bH7Qe99C9wbCQPS90x7VqFZl55LOjWQzfDB5t7jlU-cYMnRD5GADDqCyC68-g-V-dS69PYiYbJcEx1Y_UHc8D0tw-O8EuEto_SWXp-k485IOGW3K-oV9ws4nJiHq9G88KXfRas3QqB-cv_3iAgvwVwygChjILt-0LrzozC3g4Gh3Tfn9WE7VjBKlokl9LeUnL1nB9yoFr1gQMx3MMgyXrMQ2SXWdoJtbFc4Jl6Gt6ctA',
      ],
      condition: 'Used',
      category: 'Classics',
      specs: ['Restoration Project', 'Manual', 'Collector Grade'],
      status: 'Active Listing',
      sellerId: user.id,
    },
  });

  await prisma.post.create({
    data: {
      title: 'Daily Driver Market Watch',
      summary: 'Why usable classics are gaining attention this month.',
      content:
        'Collectors are paying closer attention to cars that can still handle a commute. The market is rewarding history, usability, and documented maintenance.',
      status: PostStatus.DRAFT,
      authorId: user.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200',
            publicId: 'seed/posts/bmw-m3-e30',
            caption: 'A classic performance sedan with daily-driver appeal.',
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed data has been inserted.');
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
