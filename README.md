# Cocoa Comaa

A modern e-commerce platform for custom dessert ordering, built with Next.js 15 and TypeScript. The platform enables customers to order custom cakes and desserts, purchase postal brownie packages, and register for baking workshops.

## Features

### Customer Features

- **Custom Dessert Ordering** - Browse and order custom cakes, desserts, and seasonal specials
- **Postal Brownie Delivery** - Pre-packaged brownie combos with nationwide shipping
- **Workshop Registration** - Discover and register for baking workshops and events
- **Order Tracking** - Real-time order status updates and history
- **Secure Payments** - Integrated Razorpay payment gateway with webhook verification
- **Email Notifications** - Automated order confirmations and status updates

### Administrative Features

- **Product Management** - CRUD operations for desserts, specials, and postal products
- **Order Management** - View, update, and track customer orders
- **Workshop Management** - Create and manage workshop events and registrations
- **Role-Based Access** - Admin (full access) and Manager (read-only orders) roles
- **Analytics** - Order insights and customer data management

## Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router and Server Components
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with Shadcn UI components
- **Forms**: TanStack Form with Zod validation
- **State Management**: React hooks and server state

### Backend

- **API**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Google OAuth + Credentials)
- **File Storage**: Vercel Blob
- **Email**: React Email with Resend integration
- **Payments**: Razorpay API

### DevOps & Monitoring

- **Hosting**: Vercel
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics
- **Code Quality**: Biome (linting & formatting)

## Prerequisites

- Node.js ≥22
- pnpm 10.7.0
- PostgreSQL database
- Environment variables (see Configuration section)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cocoacomaa

# Install dependencies
pnpm install
```

### Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cocoacomaa

# Authentication
AUTH_SECRET=your-secret-key
AUTH_GOOGLE_ID=your-google-oauth-id
AUTH_GOOGLE_SECRET=your-google-oauth-secret

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Email
RESEND_API_KEY=your-resend-api-key

# Vercel Blob (for file uploads)
BLOB_READ_WRITE_TOKEN=your-blob-token

# Sentry (optional)
SENTRY_AUTH_TOKEN=your-sentry-token
```

### Database Setup

```bash
# Push database schema
pnpm db:push

# Seed initial data (optional)
pnpm db:seed

# Create admin user
pnpm create-admin

# Create manager user (read-only access)
pnpm create-manager
```

### Development

```bash
# Start development server with Turbopack
pnpm dev

# Open http://localhost:3000
```

### Email Development

```bash
# Start email preview server
pnpm email:dev

# Test email templates
pnpm test:email
pnpm test:status-email
```

## Available Scripts

### Development

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Create production build
- `pnpm start` - Start production server

### Database

- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:seed` - Seed database with initial data
- `pnpm create-admin` - Create admin user via CLI
- `pnpm create-manager` - Create manager user via CLI

### Code Quality

- `pnpm lint` - Check code with Biome
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Biome

### Email

- `pnpm email:dev` - Email development server
- `pnpm test:email` - Test email functionality
- `pnpm test:status-email` - Test status update emails

## Project Structure

```text
cocoacomaa/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication routes
│   │   ├── (user)/           # Customer-facing pages
│   │   ├── (legal)/          # Legal pages (terms, privacy)
│   │   ├── admin/            # Admin dashboard
│   │   ├── manager/          # Manager dashboard
│   │   └── api/              # API routes
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utilities, database schema, config
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript type definitions
├── scripts/                  # Utility scripts
├── public/                   # Static assets
└── emails/                   # React Email templates
```

## Key Features Implementation

### Authentication & Authorization

- NextAuth.js v5 with JWT strategy
- Google OAuth and credential-based authentication
- Role-based middleware protection (admin, manager, customer)
- Protected API routes and server actions

### Payment Processing

- Razorpay integration with order creation and verification
- Webhook handling for payment confirmation
- Dynamic delivery cost calculation (Bengaluru vs other areas)
- Configurable processing fee (2.6%)

### Email System

- React Email components for professional templates
- Automated order confirmations and status updates
- Development preview server for testing
- Resend integration for reliable delivery

### Database Management

- Drizzle ORM with type-safe queries
- PostgreSQL schemas for products, orders, users, workshops
- Relational data modeling with foreign keys
- Migration-free development with `db:push`

## Development Workflow

1. **Schema Changes**: Update `src/lib/db/schema.ts`, then run `pnpm db:push`
2. **Code Quality**: Run `pnpm lint:fix` before committing
3. **Email Testing**: Use `pnpm email:dev` to preview templates
4. **User Management**: Use CLI scripts to create admin/manager accounts
5. **API Testing**: Use Drizzle Studio (`pnpm db:studio`) to inspect data

## Deployment

The application is optimized for deployment on Vercel:

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables from Configuration section are set in Vercel dashboard.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Standards

- **Formatting**: Biome with tab indentation and double quotes
- **TypeScript**: Strict mode enabled
- **Components**: Prefer React Server Components for data fetching
- **Validation**: Zod schemas for all form inputs and API requests
- **Error Handling**: Sentry integration for production monitoring

## License

This project is proprietary and confidential.

## Support

For issues, questions, or feature requests, please contact the development team.
