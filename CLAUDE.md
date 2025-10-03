# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cocoa Comaa is a Next.js 15 e-commerce application for ordering custom desserts online. The application includes user authentication, dessert ordering, admin management, payment integration with Razorpay, and email notifications.

## Development Commands

### Package Management

- **Package Manager**: pnpm (version 10.7.0)
- **Node Requirements**: Node.js >=22

### Core Development Commands

```bash
# Development server with Turbopack
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Code quality
pnpm lint              # Check code with Biome
pnpm lint:fix          # Fix linting issues automatically
pnpm format            # Format code with Biome
```

### Database Operations (Drizzle ORM)

```bash
# Push schema changes to database
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed database with initial data
pnpm db:seed

# Create admin user
pnpm create-admin

# Create manager user (read-only access)
pnpm create-manager
```

### Email Development

```bash
# Start email development server
pnpm email:dev

# Test email functionality
pnpm test:email
pnpm test:status-email
```

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (beta)
- **Styling**: Tailwind CSS v4 with Shadcn UI
- **Payment**: Razorpay integration
- **Email**: React Email with Resend
- **Monitoring**: Sentry error tracking
- **Analytics**: Vercel Analytics
- **File Storage**: Vercel Blob
- **Code Quality**: Biome for linting and formatting

### Project Structure

#### App Router Organization

- `src/app/(auth)/` - Authentication routes (login, signup, forgot password)
- `src/app/(user)/` - Customer-facing pages (checkout, orders, postal brownies, workshops, specials)
- `src/app/(legal)/` - Legal pages (terms, privacy, about)
- `src/app/admin/` - Admin dashboard and management
- `src/app/manager/` - Manager dashboard (read-only orders access)
- `src/app/api/` - API routes for backend functionality

#### Key Directories

- `src/lib/` - Shared utilities, database schema, and configuration
- `src/components/` - Reusable React components
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `scripts/` - Utility scripts for admin/manager creation and email testing

### Database Schema

The application uses Drizzle ORM with PostgreSQL. Key entities include:

- **desserts** - Product catalog with categories (cake, dessert, special)
- **orders** - Customer orders with order items
- **users** - User accounts and profiles
- **addresses** - Customer delivery addresses
- **postal_combos** - Special postal brownie products
- **workshops** - Workshop events and registrations
- **workshop_orders** - Workshop order tracking

### Authentication & Authorization

- NextAuth.js v5 with custom providers (Google OAuth and Credentials)
- Role-based access (admin, manager, customer)
  - Admin: Full read/write access to all areas
  - Manager: Read-only access to orders only
  - Customer: Access to their own orders and account
- JWT session strategy with role-based middleware protection

### Payment Integration

- Razorpay for payment processing
- Webhook handling for payment verification
- Configurable processing fee (currently 2.6%)
- Delivery cost calculation based on location (Bengaluru vs other areas)

### Email System

- React Email templates
- Automated order confirmations and status updates
- Development server for email testing
- Resend integration for production emails

### Key Configuration Files

- `drizzle.config.ts` - Database configuration
- `next.config.ts` - Next.js config with Sentry integration
- `sentry.*.config.ts` - Error monitoring configuration
- `biome.json` - Code formatting and linting rules (tab indentation, double quotes)
- `src/auth.ts` & `src/auth.config.ts` - Authentication configuration

## Development Workflow

1. **Database Changes**: After schema changes, run `pnpm db:push` to update the database
2. **Code Quality**: Run `pnpm lint:fix` before committing
3. **Testing Emails**: Use `pnpm email:dev` to preview email templates
4. **Admin Access**: Create admin users with `pnpm create-admin` script
5. **Manager Access**: Create manager users with `pnpm create-manager` script (read-only orders)

## Important Notes

- The application requires environment variables for database, authentication, payment, and email services
- Sentry monitoring is configured with custom tunnel route at `/monitoring`
- The app uses route groups for organization (parentheses in folder names) without actual routing separation
- Biome is used for code formatting with tab indentation and double quotes
- Lead time for dessert orders is configurable per product (default 3 days)
- Order types include both cake-orders and postal-brownies with different fulfillment flows
- Handle timestamp formatting using src/lib/format-timestamp.ts
- Prefer RSC for data fetching; use React Query for client-side fetching
