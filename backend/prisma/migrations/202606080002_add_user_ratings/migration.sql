CREATE TABLE "user_ratings" (
  "id" TEXT NOT NULL,
  "raterId" TEXT NOT NULL,
  "targetUserId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_ratings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_ratings_raterId_targetUserId_key" ON "user_ratings"("raterId", "targetUserId");
CREATE INDEX "user_ratings_targetUserId_idx" ON "user_ratings"("targetUserId");

ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_raterId_fkey"
FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_targetUserId_fkey"
FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_score_check"
CHECK ("score" >= 1 AND "score" <= 5);
