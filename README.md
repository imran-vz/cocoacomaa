# Dessert Ordering Platform

A production-ready dessert ordering platform built with Next.js, Shadcn UI, Drizzle ORM, and SQLite.

## Features

- Custom cake ordering system
- Secure payment processing with Stripe
- Order management dashboard
- Real-time order status updates
- Responsive design with modern UI

## Prerequisites

- Node.js 22 or higher
- pnpm 10.7.0 or higher
- Stripe account for payment processing

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd dessert-ordering-platform
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy the environment variables:

```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your Stripe API keys and other configuration.

5. Initialize the database:

```bash
pnpm drizzle-kit push:sqlite
```

6. Start the development server:

```bash
pnpm dev
```

## Environment Variables

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `DATABASE_URL`: SQLite database URL

## Project Structure

```
src/
  ├── app/                 # Next.js app directory
  │   ├── admin/          # Admin dashboard
  │   ├── api/            # API routes
  │   └── order-confirmation/  # Order confirmation page
  ├── components/         # React components
  │   └── ui/            # Shadcn UI components
  └── lib/               # Utility functions and configurations
      └── db/            # Database configuration and schema
```

## Development

- Run the development server: `pnpm dev`
- Build for production: `pnpm build`
- Start production server: `pnpm start`
- Run linting: `pnpm lint`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
