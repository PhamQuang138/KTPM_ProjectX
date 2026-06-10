CREATE TYPE "public"."ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "public"."articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT,
    "author" TEXT NOT NULL,
    "readTime" TEXT,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "status" "public"."ArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "articles_category_idx" ON "public"."articles"("category");
CREATE INDEX "articles_status_idx" ON "public"."articles"("status");
