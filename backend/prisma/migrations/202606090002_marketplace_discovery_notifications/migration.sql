ALTER TABLE "garage_vehicles"
ADD COLUMN "make" TEXT,
ADD COLUMN "model" TEXT,
ADD COLUMN "year" INTEGER,
ADD COLUMN "mileage" INTEGER,
ADD COLUMN "bodyType" TEXT,
ADD COLUMN "fuelType" TEXT,
ADD COLUMN "transmission" TEXT;

UPDATE "garage_vehicles"
SET
  "year" = CASE WHEN "title" ~ '^[0-9]{4} ' THEN substring("title" from '^[0-9]{4}')::INTEGER ELSE NULL END,
  "make" = CASE WHEN "title" ~ '^[0-9]{4} ' THEN split_part("title", ' ', 2) ELSE NULL END,
  "model" = CASE WHEN "title" ~ '^[0-9]{4} ' THEN regexp_replace("title", '^[0-9]{4}\s+\S+\s*', '') ELSE "title" END,
  "bodyType" = CASE
    WHEN "title" ILIKE '%SUV%' THEN 'SUV'
    WHEN "title" ILIKE '%Sedan%' THEN 'Sedan'
    WHEN "title" ILIKE '%Convertible%' THEN 'Convertible'
    ELSE 'Coupe'
  END,
  "fuelType" = 'Gasoline',
  "transmission" = CASE WHEN 'Manual' = ANY("specs") THEN 'Manual' ELSE 'Automatic' END,
  "mileage" = CASE WHEN "condition" = 'New' THEN 0 ELSE 25000 END;

ALTER TABLE "conversations"
ALTER COLUMN "listingId" DROP NOT NULL,
ADD COLUMN "directKey" TEXT;

CREATE UNIQUE INDEX "conversations_directKey_key" ON "conversations"("directKey");

CREATE TABLE "post_bookmarks" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "post_bookmarks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "post_bookmarks_postId_userId_key" ON "post_bookmarks"("postId", "userId");
CREATE INDEX "post_bookmarks_userId_createdAt_idx" ON "post_bookmarks"("userId", "createdAt");
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "listing_favorites" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "listing_favorites_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "listing_favorites_listingId_userId_key" ON "listing_favorites"("listingId", "userId");
CREATE INDEX "listing_favorites_userId_createdAt_idx" ON "listing_favorites"("userId", "createdAt");
ALTER TABLE "listing_favorites" ADD CONSTRAINT "listing_favorites_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "vehicle_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_favorites" ADD CONSTRAINT "listing_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "listing_comments" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "listing_comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "listing_comments_listingId_createdAt_idx" ON "listing_comments"("listingId", "createdAt");
CREATE INDEX "listing_comments_userId_idx" ON "listing_comments"("userId");
ALTER TABLE "listing_comments" ADD CONSTRAINT "listing_comments_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "vehicle_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_comments" ADD CONSTRAINT "listing_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "link" TEXT,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_recipientId_readAt_createdAt_idx" ON "notifications"("recipientId", "readAt", "createdAt");
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
