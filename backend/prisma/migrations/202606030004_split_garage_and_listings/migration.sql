CREATE TABLE "garage_vehicles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "condition" TEXT NOT NULL DEFAULT 'Used',
    "specs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'In Garage',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "garage_vehicles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Daily',
    "status" TEXT NOT NULL DEFAULT 'Active Listing',
    "sellerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_listings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "garage_vehicles_ownerId_idx" ON "garage_vehicles"("ownerId");
CREATE INDEX "vehicle_listings_sellerId_idx" ON "vehicle_listings"("sellerId");
CREATE INDEX "vehicle_listings_vehicleId_idx" ON "vehicle_listings"("vehicleId");
CREATE INDEX "vehicle_listings_category_idx" ON "vehicle_listings"("category");

ALTER TABLE "garage_vehicles" ADD CONSTRAINT "garage_vehicles_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vehicle_listings" ADD CONSTRAINT "vehicle_listings_sellerId_fkey"
FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vehicle_listings" ADD CONSTRAINT "vehicle_listings_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "garage_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
