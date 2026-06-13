ALTER TABLE "users"
ADD COLUMN "themePreference" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN "displayDensity" TEXT NOT NULL DEFAULT 'comfortable',
ADD COLUMN "fontScale" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN "autoOpenChatbot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "notifySocial" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyMarketplace" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "notifyMessages" BOOLEAN NOT NULL DEFAULT true;
