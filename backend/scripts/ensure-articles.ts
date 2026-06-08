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
  const count = await prisma.article.count();
  if (count > 0) {
    console.log(`Articles already exist: ${count}`);
    return;
  }

  await prisma.article.createMany({
    data: articlesSeed.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.excerpt,
      author: article.author,
      readTime: article.readTime,
      image: article.image,
      category: article.category,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(article.date),
      createdAt: new Date(article.createdAt),
      updatedAt: new Date(article.updatedAt),
    })),
    skipDuplicates: true,
  });

  console.log(`Inserted ${articlesSeed.length} articles.`);
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
