CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
