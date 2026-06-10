import 'dotenv/config';
import {ArticleStatus, PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import {articlesSeed} from '../src/data/seeds';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

async function main() {
  await prisma.$transaction([
    prisma.article.deleteMany({
      where: {id: {notIn: articlesSeed.map((article) => article.id)}},
    }),
    ...articlesSeed.map((article) =>
      prisma.article.upsert({
        where: {id: article.id},
        create: {
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          readTime: article.readTime,
          image: article.image,
          category: article.category,
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(article.date),
          createdAt: new Date(article.createdAt),
          updatedAt: new Date(article.updatedAt),
        },
        update: {
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          readTime: article.readTime,
          image: article.image,
          category: article.category,
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(article.date),
        },
      }),
    ),
  ]);

  console.log(`Synchronized ${articlesSeed.length} published articles.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
