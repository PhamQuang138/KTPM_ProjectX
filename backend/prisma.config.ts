import 'dotenv/config';
import {defineConfig} from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node-dev --transpile-only --exit-child prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/carhub?schema=public',
  },
});
