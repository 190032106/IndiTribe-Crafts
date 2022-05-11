# IndiTribe Crafts

A modern marketplace for authentic handmade crafts created by tribal and indigenous artisans across India.

## Features

- Customer authentication and accounts
- Product catalogue, search and filtering
- Product details with artisan stories
- Wishlist and shopping cart
- Checkout flow with simulated payments
- Artisan/seller onboarding and product management
- Admin marketplace management
- Responsive, accessible storefront
- Supabase authentication and database with row-level security

## Tech Stack

- React + TypeScript
- TanStack Start / TanStack Router
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)
- Zod and React Hook Form

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project

### Installation

```bash
npm install
```

Copy `.env.example` to `.env` and add your Supabase project values.

```bash
npm run dev
```

The development server will print the local URL.

### Production build

```bash
npm run build
```

## Environment Variables

The application expects these variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL` (server-side)
- `SUPABASE_PUBLISHABLE_KEY` (server-side)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never expose to the browser)

## Security

Never commit `.env` or service-role credentials. Database access is protected with Supabase Row Level Security policies.
