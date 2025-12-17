# Security Implementation - Remaining Tasks

## ✅ Priority 1 - COMPLETED
All 11 critical ship-blocking vulnerabilities fixed and deployed.

---

## Priority 2 - Security Hardening

### 1. Filter password hashes from admin API responses
**Status**: Not started
**Files**:
- `src/app/api/admin/users/route.ts:14`
- `src/app/api/admin/managers/route.ts:22-25`

**Issue**: Admin endpoints return ALL user fields including password hashes

**Fix**:
```typescript
const usersList = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
    phone: users.phone,
    role: users.role,
    emailVerified: users.emailVerified,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    // Explicitly exclude: password, image
  })
  .from(users);
```

---

### 2. Fix manager creation without passwords
**Status**: Not started
**File**: `src/app/api/admin/managers/route.ts:62-70`
**Requires**: DB migration to add `forcePasswordChange` column

**Issue**: Managers created without passwords cannot log in via credentials

**Implementation**:
```typescript
import { randomBytes } from "node:crypto";
import { SECURITY_CONFIG } from "@/lib/security-config";

// Generate secure temp password
const tempPassword = randomBytes(16).toString("hex");
const hashedPassword = await bcrypt.hash(tempPassword, SECURITY_CONFIG.bcryptRounds);

const [newManager] = await db
  .insert(users)
  .values({
    ...validatedData,
    role: "manager",
    password: hashedPassword,
    forcePasswordChange: true, // NEW COLUMN NEEDED
  })
  .returning();

// Send email with temp password
await resend.emails.send({
  from: "Cocoa Comaa <noreply@cocoacomaa.com>",
  to: [newManager.email],
  subject: "Manager Account Created",
  html: `
    <p>Your manager account has been created.</p>
    <p>Temporary password: <strong>${tempPassword}</strong></p>
    <p>You will be required to change this password on first login.</p>
  `,
});
```

**DB Migration Required**:
```sql
ALTER TABLE users ADD COLUMN force_password_change BOOLEAN DEFAULT false;
```

---

## Priority 3 - Business Logic

### 3. Fix workshop booking race condition
**Status**: Not started
**File**: `src/app/api/workshop-orders/route.ts:136-172`

**Issue**: Gap between checking slots and inserting order allows overbooking

**Race scenario**:
- User A checks: 1 slot available ✓
- User B checks: 1 slot available ✓ (same time)
- Both book: success (OVERBOOKED)

**Fix**: Use Drizzle transaction with PostgreSQL row locking
```typescript
await db.transaction(async (tx) => {
  // Lock workshop row for update
  const [workshop] = await tx
    .select()
    .from(workshops)
    .where(eq(workshops.id, workshopId))
    .for("update") // PostgreSQL row lock
    .limit(1);

  if (!workshop) {
    throw new Error("Workshop not found");
  }

  // Recalculate slots within transaction (still locked)
  const [totalSlotsUsed] = await tx
    .select({
      totalSlots: sql<number>`coalesce(sum(${workshopOrders.slots}), 0)`,
    })
    .from(workshopOrders)
    .where(
      and(
        eq(workshopOrders.workshopId, workshopId),
        ne(workshopOrders.status, "cancelled")
      )
    )
    .for("update"); // Lock order rows too

  const availableSlots = workshop.maxBookings - (totalSlotsUsed?.totalSlots || 0);

  if (availableSlots < actualSlots) {
    throw new Error("Insufficient slots available");
  }

  // Insert order (still within lock)
  const [order] = await tx
    .insert(workshopOrders)
    .values({
      workshopId,
      userId,
      slots: actualSlots,
      // ... other fields
    })
    .returning();

  return order;
}, {
  timeout: 5000, // 5s timeout
});
```

**Considerations**:
- Add 5s transaction timeout
- Handle timeout gracefully (rollback)
- Test with concurrent bookings

---

### 4. Add XSS sanitization utility
**Status**: Not started
**File**: `src/lib/sanitize.ts` (NEW)

**Purpose**: Defense-in-depth for user input (React already escapes JSX)

**Implementation**:
```typescript
/**
 * Basic HTML entity encoding to prevent XSS
 * Note: React already escapes JSX interpolations, this is defense-in-depth
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize for HTML attribute contexts
 */
export function sanitizeAttribute(input: string): string {
  return input
    .replace(/[^\w\s-]/g, "") // Keep only word chars, spaces, hyphens
    .trim();
}
```

**Apply to**:
- Order notes field (API routes)
- User names (registration)
- Address fields (checkout)

---

## Priority 4 - Defense in Depth

### 5. Create global middleware
**Status**: Not started
**File**: `middleware.ts` (NEW - ROOT LEVEL)

**Purpose**: Global route protection + security headers

**Implementation**:
```typescript
export { default } from "next-auth/middleware";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/api/admin/:path*",
  ],
};

export async function middleware(request) {
  const session = await auth();
  const path = request.nextUrl.pathname;

  // Admin routes - only admins
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    if (session?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Manager routes - admins and managers only
  if (path.startsWith("/manager")) {
    if (!["admin", "manager"].includes(session?.user?.role || "")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}
```

**Note**: Middleware catches page routes. API routes still need explicit checks (can't distinguish GET vs POST in matcher).

---

### 6. Add security headers to next.config
**Status**: Not started
**File**: `next.config.ts`

**Implementation**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

### 7. Create separate manager routes
**Status**: Not started
**Decision**: Cleaner architecture than per-page checks in /admin

**Implementation**:

**7a. Create manager layout**
**File**: `src/app/manager/layout.tsx` (NEW)
```typescript
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Only managers and admins can access
  if (!["admin", "manager"].includes(session?.user?.role || "")) {
    redirect("/");
  }

  return (
    <div className="manager-layout">
      <nav>Manager Dashboard</nav>
      {children}
    </div>
  );
}
```

**7b. Create manager orders page**
**File**: `src/app/manager/orders/page.tsx` (NEW)
```typescript
import { auth } from "@/auth";
import { db } from "@/lib/db";
// Reuse admin orders logic but read-only UI
```

**7c. Update admin layout to reject managers**
**File**: `src/app/admin/layout.tsx:35`
```typescript
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Only admins allowed (NOT managers)
  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
```

---

## Testing Checklist

### Critical paths to test:
- [ ] Admin users/managers endpoints don't return password hashes
- [ ] New managers receive temp password email
- [ ] New managers forced to change password on first login
- [ ] Workshop concurrent bookings don't allow overbooking
- [ ] XSS attempts in order notes/names are sanitized
- [ ] Managers redirected from /admin to /manager
- [ ] Security headers present in responses
- [ ] Middleware blocks unauthorized access to admin/manager routes

### Performance:
- [ ] Workshop transaction timeout (5s) doesn't impact UX
- [ ] Middleware overhead minimal (<10ms)

---

## Implementation Order

1. **Filter password hashes** (quick, no dependencies)
2. **Add security headers** (quick, no dependencies)
3. **Create middleware** (quick, enhances #2)
4. **Create manager routes** (medium, improves architecture)
5. **Add XSS sanitization** (medium, apply to existing endpoints)
6. **Fix manager creation** (medium, requires DB migration)
7. **Fix workshop race condition** (complex, requires thorough testing)

---

## Notes

- All tasks are non-blocking (Priority 1 already deployed)
- Can be implemented incrementally
- Workshop race condition most complex - thorough testing required
- Manager creation requires DB migration - coordinate with team
- Consider creating integration tests for race condition scenarios
