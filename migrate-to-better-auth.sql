-- Migration: NextAuth to Better Auth
-- Big bang migration with forced re-login

BEGIN;

-- ============================================
-- 1. Update users table (preserve data!)
-- ============================================

-- Change emailVerified from timestamp to boolean
ALTER TABLE users ADD COLUMN email_verified_new boolean DEFAULT false NOT NULL;
UPDATE users SET email_verified_new = ("emailVerified" IS NOT NULL);
ALTER TABLE users DROP COLUMN "emailVerified";
ALTER TABLE users RENAME COLUMN email_verified_new TO email_verified;

-- Make name NOT NULL (use email as fallback for existing nulls)
UPDATE users SET name = COALESCE(name, email) WHERE name IS NULL OR name = '';
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- ============================================
-- 2. Drop and recreate accounts table
-- ============================================
-- Since we're forcing re-login, drop old accounts
-- Users will re-authenticate and create new account records
DROP TABLE IF EXISTS account CASCADE;

CREATE TABLE account (
  id text PRIMARY KEY,
  "userId" text NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "accessToken" text,
  "refreshToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  scope text,
  "idToken" text,
  password text,
  "createdAt" timestamp DEFAULT NOW() NOT NULL,
  "updatedAt" timestamp DEFAULT NOW() NOT NULL,
  CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 3. Create credential accounts for existing users with passwords
-- ============================================
-- This is CRITICAL - without this, existing users can't login!
-- Better Auth requires an account record to authenticate
INSERT INTO account (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
SELECT
  'acc_' || substr(md5(random()::text), 1, 20) as id,
  id as "userId",
  email as "accountId",
  'credential' as "providerId",
  password,
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM users
WHERE password IS NOT NULL AND password != '';

-- ============================================
-- 4. Drop and recreate sessions table
-- ============================================
-- Since we're forcing re-login, drop all sessions
DROP TABLE IF EXISTS session CASCADE;

CREATE TABLE session (
  id text PRIMARY KEY,
  token text NOT NULL UNIQUE,
  "userId" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" timestamp DEFAULT NOW() NOT NULL,
  "updatedAt" timestamp DEFAULT NOW() NOT NULL,
  CONSTRAINT "session_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 5. Drop and recreate verification table
-- ============================================
-- Drop old verificationToken table
DROP TABLE IF EXISTS "verificationToken" CASCADE;

-- Create new verification table
CREATE TABLE verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT NOW() NOT NULL,
  "updatedAt" timestamp DEFAULT NOW() NOT NULL
);

-- ============================================
-- 6. Drop password_reset_tokens (using better-auth now)
-- ============================================
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

COMMIT;

-- Summary:
-- - Users table: migrated with data preserved
-- - Accounts: dropped/recreated with credential accounts for password users
-- - Sessions: dropped/recreated (forced re-login)
-- - Verification: recreated with better-auth schema
-- - Password resets: dropped (using better-auth now)
--
-- IMPORTANT: Existing users with passwords can now login immediately
-- OAuth users (Google) will create accounts on first sign-in
