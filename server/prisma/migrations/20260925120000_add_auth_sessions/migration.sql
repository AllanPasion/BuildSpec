CREATE TABLE "AuthSession" (
  "tokenHash" TEXT NOT NULL,
  "githubUserId" TEXT NOT NULL,
  "githubLogin" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("tokenHash")
);

CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

ALTER TABLE "AuthSession" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "AuthSession" FROM anon, authenticated;
