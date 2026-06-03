CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "condition" TEXT NOT NULL DEFAULT 'Used',
    "category" TEXT NOT NULL DEFAULT 'Daily',
    "specs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'Active Listing',
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicles_sellerId_idx" ON "vehicles"("sellerId");
CREATE INDEX "vehicles_category_idx" ON "vehicles"("category");

ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_sellerId_fkey"
FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
