IndiTribe Crafts

A full-stack e-commerce marketplace that connects customers with tribal and indigenous artisans across India, helping showcase and sell authentic handmade products while preserving artisan stories and cultural heritage.






Table of Contents

About the Project

Why IndiTribe Crafts

Main Features

User Roles

Technology Stack

Application Flow

Project Structure

Prerequisites

Run the Project Locally

Supabase Setup

Environment Variables

Database and Seed Data

Available Commands

Application Routes

Authentication

Security

Testing the Application

Production Build

Troubleshooting

Git Workflow

Development Notes

Future Improvements

License

About the Project

IndiTribe Crafts is a modern tribal-artisan marketplace designed around three main goals:

Help artisans reach customers beyond their local communities.

Give customers a simple e-commerce experience for discovering and purchasing handmade products.

Preserve the story behind each product by connecting products with artisan profiles, regions, categories and cultural information.

The application includes a customer storefront, product catalogue, artisan information, authentication, wishlist, shopping cart, checkout flow and seller functionality.

Project note: This repository is a modernized implementation of the IndiTribe Crafts concept. The current source code uses modern versions of its frameworks and dependencies. The historical Git commit dates in this repository are maintained for an academic Git/version-control assignment and should not be interpreted as the release dates of the current dependency versions.

Why IndiTribe Crafts?

Traditional crafts are often produced by small artisan communities with limited access to larger digital marketplaces. A dedicated marketplace can provide:

Better product visibility

Direct discovery of artisan stories

Regional and cultural context

Easier online shopping

A structured catalogue for handmade products

A foundation for future artisan-to-customer commerce

The platform is therefore designed as more than a normal online shop: the artisan and the story behind the product are part of the shopping experience.

Main Features

Customer Features

Browse the product catalogue

Search and filter products

Browse products by category

View detailed product pages

View artisan information and stories

Add products to a wishlist

Add products to a shopping cart

Update cart quantities

Remove products from the cart

Create an account and sign in

Manage account information

Complete a simulated checkout flow

View store policies, shipping information and returns information

Contact and FAQ pages

Artisan / Seller Features

Seller onboarding flow

Artisan profile information

Product management workflow

Artisan-specific product information

Product storytelling and cultural context

Platform / Admin Features

Marketplace-oriented data model

Product and artisan relationships

Category and regional organization

Authentication and authorization support

Supabase Row Level Security policies

Structured database migrations

User Experience

Responsive design for desktop and mobile screens

Reusable UI components

Accessible form controls

Product cards and rating components

Toast notifications and user feedback

Client-side validation

Clean marketplace-style navigation

User Roles

The application is designed around different types of users:

Role

Purpose

Guest

Browse products, categories, artisans and public pages

Customer

Manage account, wishlist, cart and checkout

Artisan / Seller

Manage artisan and product information

Admin

Manage marketplace-level information and operations

Authentication and database permissions are handled through Supabase.

Technology Stack

Frontend

React – component-based user interface

TypeScript – static typing and safer application development

TanStack Start – application framework and routing integration

TanStack Router – type-safe application routing

TanStack Query – server-state and asynchronous data management

Tailwind CSS – utility-first styling

Radix UI – accessible UI primitives

Lucide React – icons

Forms and Validation

React Hook Form – form state management

Zod – schema validation

@hookform/resolvers – connects Zod validation with React Hook Form

Backend / Database

Supabase

PostgreSQL database

Authentication

Storage support

Row Level Security (RLS)

Server-side Supabase clients

Development Tools

Node.js

npm

Vite

TypeScript

ESLint

Prettier

Git / GitHub

Application Flow

A typical customer journey looks like this:

Landing Page
     |
     v
Browse Shop
     |
     +------> Categories
     |
     +------> Artisans
     |
     v
Product Details
     |
     +------> Wishlist
     |
     v
Shopping Cart
     |
     v
Checkout
     |
     v
Order / Purchase Confirmation

The checkout currently represents a simulated payment flow rather than a live payment gateway transaction.

Project Structure

The important project directories are organized approximately as follows:

inditribe-crafts/
│
├── public/                         # Public/static assets
│
├── src/
│   ├── components/                 # Reusable UI components
│   ├── integrations/
│   │   └── supabase/               # Supabase clients and integration code
│   │
│   ├── lib/                        # Shared utilities and application helpers
│   │
│   ├── routes/                     # Application pages/routes
│   │   ├── index.tsx               # Home page
│   │   ├── shop.tsx                # Product catalogue
│   │   ├── product.$slug.tsx       # Product details
│   │   ├── categories.tsx          # Categories
│   │   ├── artisans.tsx            # Artisan directory
│   │   ├── account.tsx             # Customer account
│   │   ├── auth.tsx                # Authentication
│   │   ├── cart.tsx                # Shopping cart
│   │   ├── checkout.tsx            # Checkout
│   │   ├── wishlist.tsx            # Wishlist
│   │   ├── sell.tsx                # Seller onboarding
│   │   └── ...                     # Policy, FAQ and information pages
│   │
│   └── styles/                     # Global styles
│
├── supabase/
│   ├── config.toml                 # Supabase local/configuration settings
│   └── migrations/                 # Database schema, policies and seed data
│
├── .env.example                    # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Prerequisites

Before running the project, install the following software.

1. Node.js

Install Node.js 20 or later.

Verify your installation:

node --version

You should see a version similar to:

v20.x.x

or newer.

2. npm

npm is included with Node.js.

Check it with:

npm --version

3. Git

Git is required if you want to clone the project from GitHub.

Check it with:

git --version

4. Supabase account

You need a Supabase project because the application uses Supabase for authentication and database functionality.

Create a project from the Supabase dashboard before starting the application.

Run the Project Locally

This section is intentionally written step-by-step so that someone who has never used this project can run it from a fresh computer.

Step 1 – Clone the repository

Open a terminal or PowerShell window and run:

git clone https://github.com/190032106/IndiTribe-Crafts.git

Move into the project directory:

cd IndiTribe-Crafts

If you are using VS Code, you can open the project with:

code .

If the code command is not available, open VS Code manually and select:

File → Open Folder → IndiTribe-Crafts

Step 2 – Install dependencies

Inside the project folder run:

npm install

This reads package.json and installs the required dependencies into node_modules.

You normally only need to run this once after cloning. Run it again if package.json changes or if you remove node_modules.

Step 3 – Create your environment file

The repository intentionally does not contain the real Supabase credentials.

Copy the example environment file.

Windows PowerShell

Copy-Item .env.example .env

Windows Command Prompt

copy .env.example .env

macOS / Linux

cp .env.example .env

You should now have:

.env
.env.example

The .env file is ignored by Git and must not be committed.

Step 4 – Configure Supabase credentials

Open .env in VS Code.

It will look similar to:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key

Replace the placeholder values with the credentials from your Supabase project.

Important: Never publish or commit the SUPABASE_SERVICE_ROLE_KEY.

Step 5 – Set up the database

The repository contains Supabase migrations under:

supabase/migrations/

These migrations contain the application's database structure, policies and initial marketplace data.

The initial data includes example regions, categories, artisans, products, product images and reviews.

Option A – Supabase SQL Editor

If you are setting up the project using the Supabase dashboard:

Open your Supabase project.

Open SQL Editor.

Create a new SQL query.

Open the migration files from supabase/migrations/.

Run the migration SQL in chronological order.

Wait for each migration to complete successfully before running the next one.

Open Table Editor and confirm that the application tables were created.

Run migrations in filename order because later migrations depend on objects created by earlier migrations.

Option B – Supabase CLI

If you already use the Supabase CLI, you can use its normal migration workflow instead of manually copying SQL into the dashboard.

Make sure the project is correctly linked to your Supabase project before applying migrations.

Step 6 – Start the development server

Run:

npm run dev

Vite will start the development server and display a local address in the terminal, normally similar to:

http://localhost:5173

Open the displayed URL in your browser.

If the terminal shows a different port, use the URL printed by Vite.

Step 7 – Make a code change

For example, open:

src/routes/index.tsx

Make a small change and save the file.

The development server uses hot reload, so the browser should update automatically.

Supabase Setup

The application expects a Supabase backend.

At a high level, the setup is:

React / TanStack Application
          |
          | Supabase client
          v
       Supabase
          |
     +----+----+
     |         |
     v         v
 PostgreSQL   Auth
     |
     v
 Row Level Security

The project uses Supabase for:

User authentication

Product data

Artisan data

Categories

Regions

Reviews

Wishlist-related data

Cart-related data

Database authorization policies

Server-side database operations

Environment Variables

The project uses the following variables.

Variable

Purpose

Safe to expose in browser?

VITE_SUPABASE_URL

Supabase project URL used by the frontend

Yes

VITE_SUPABASE_PUBLISHABLE_KEY

Supabase publishable client key

Yes

SUPABASE_URL

Supabase URL used by server-side code

Server-side configuration

SUPABASE_PUBLISHABLE_KEY

Publishable key used by server-side integrations

Server-side configuration

SUPABASE_SERVICE_ROLE_KEY

Privileged server-side Supabase access

No – keep secret

Never do this

Do not put the service-role key directly into React components or browser-side code.

Do not commit .env to GitHub.

The repository's .gitignore is configured to ignore environment files while keeping .env.example available as a setup template.

Database and Seed Data

The Supabase migration directory contains the database setup for the marketplace.

The project includes initial marketplace records so a new developer can populate the application with example content.

The seeded data covers concepts such as:

Indian regions

Product categories

Tribal / indigenous artisans

Handmade products

Product images

Product reviews

Marketplace relationships

If the Shop page displays 0 products after the application starts, the first thing to check is whether the Supabase migrations were successfully applied to the same Supabase project referenced by your .env file.

Available Commands

Run these commands from the project root.

Command

What it does

npm install

Installs project dependencies

npm run dev

Starts the local development server

npm run build

Creates a production build

npm run build:dev

Creates a development-mode build

npm run preview

Serves the production build locally

npm run lint

Runs ESLint checks

npm run format

Formats project files with Prettier

Recommended development workflow

After making changes:

npm run lint
npm run build

If both commands complete successfully, the project is generally in a good state for committing the change.

Application Routes

The main application pages include:

Route

Purpose

/

Homepage

/shop

Product catalogue

/product/:slug

Product details

/categories

Product categories

/artisans

Artisan directory

/auth

Authentication

/account

Customer account

/wishlist

Wishlist

/cart

Shopping cart

/checkout

Checkout

/sell

Seller onboarding

/our-story

Project / brand story

/contact

Contact page

/faq

Frequently asked questions

/shipping

Shipping information

/returns

Returns information

/refund-policy

Refund policy

/privacy

Privacy policy

/terms

Terms and conditions

/seller-guidelines

Seller guidelines

Route parameters may be represented differently internally by TanStack Router; the table above describes the user-facing URL structure.

Authentication

Users can create accounts and authenticate through the application's authentication flow.

The frontend communicates with Supabase Auth through the Supabase JavaScript client.

If Google authentication is enabled in your Supabase project, the application can also use Supabase's Google OAuth provider.

For OAuth to work correctly, configure the appropriate redirect URL in your Supabase authentication settings for the environment in which you are running the application.

For local development, this will normally be based on your local application URL, for example:

http://localhost:5173

Use the exact URL/redirect configuration required by your Supabase project rather than copying a production URL into a local environment.

Security

Security is handled at multiple levels.

Environment protection

.env is excluded from Git.

The service-role key must remain server-side.

.env.example contains placeholders rather than real secrets.

Database protection

Supabase Row Level Security (RLS) policies are used to control access to database records.

Application validation

Forms use React Hook Form and Zod to validate user input before it is submitted.

Important security rule

If a secret is accidentally committed to GitHub:

Remove it from the repository.

Treat the exposed credential as compromised.

Rotate/revoke the credential in the relevant service.

Replace it with a new credential in your local .env file.

Simply deleting the secret from the latest commit is not sufficient if it already exists in Git history.

Testing the Application

After starting the application with:

npm run dev

perform a basic smoke test.

Public pages

Open the homepage.

Open /shop.

Open a product.

Open /categories.

Open /artisans.

Check the FAQ, contact and policy pages.

Customer flow

Create an account or sign in.

Browse products.

Open a product detail page.

Add a product to the wishlist.

Add a product to the cart.

Change the quantity.

Remove an item.

Continue to checkout.

Test the simulated checkout flow.

Developer checks

Run:

npm run lint

Then:

npm run build

Fix any errors before pushing changes to GitHub.

Production Build

To create a production build:

npm run build

If the build completes successfully, preview the generated application locally with:

npm run preview

The terminal will display the local preview URL.

Remember that a production deployment still needs the correct environment variables and a correctly configured Supabase project.

Troubleshooting

Problem: npm is not recognized

Install Node.js and restart your terminal/VS Code.

Check:

node --version
npm --version

Problem: npm install fails

First make sure you are in the project root:

cd IndiTribe-Crafts

Then try:

npm install

If the project has a broken local dependency installation, remove node_modules and reinstall.

Windows PowerShell

Remove-Item -Recurse -Force node_modules
npm install

Problem: Supabase environment variables are missing

Check that .env exists in the project root:

IndiTribe-Crafts/
├── .env
├── package.json
└── src/

Also check that the variable names exactly match .env.example.

After changing .env, restart the development server.

Problem: Shop shows zero products

Check the following in order:

The .env points to the correct Supabase project.

The migrations have been applied.

The database tables exist.

Seed data was inserted.

Products are marked as active/approved as required by the application.

The browser console does not show a Supabase error.

The Network tab does not show failed Supabase requests.

A common cause is running the application against one Supabase project while applying the database migration to a different project.

Problem: Authentication does not work

Check:

Supabase credentials in .env.

Supabase Auth configuration.

Email/password authentication settings.

OAuth provider configuration if Google login is being used.

Redirect URLs for the current local/production environment.

Browser console errors.

Restart the development server after changing environment variables.

Problem: Port 5173 is already in use

Vite may automatically choose another available port.

Always use the URL printed in the terminal.

Alternatively, stop the process currently using the port and run:

npm run dev

Git Workflow

The project is maintained in Git and hosted on GitHub.

Repository:

IndiTribe Crafts – GitHub
https://github.com/190032106/IndiTribe-Crafts

Check changed files

git status

Review your changes

git diff

Stage changes

git add .

Create a commit

git commit -m "Describe the change"

Push to GitHub

git push

View commit history

git log --oneline --decorate --graph

Keep commit messages short and meaningful. A good commit should describe one logical change rather than several unrelated changes.

Development Notes

Modernized implementation

The current implementation uses modern versions of React, TanStack tooling, Vite, Tailwind CSS and Supabase packages.

The Git history contains historical commit dates because the repository is also being used for an academic Git/version-control exercise. This README deliberately separates the historical Git exercise from the actual technology timeline so that the project documentation remains technically honest.

Simulated checkout

The checkout experience is currently designed as a demonstration workflow. It does not represent a production payment integration with Stripe, PayPal or another payment processor.

For a real production marketplace, payment processing, order persistence, refunds, shipping integrations, tax handling and fraud prevention would need additional implementation.

Future Improvements

Possible next steps include:

Real payment gateway integration

Persistent order management

Order history for customers

Artisan dashboard

Admin dashboard

Product image upload management

Inventory tracking

Shipping provider integration

Email notifications

Product recommendations

Advanced product search

Product reviews and moderation workflow

Analytics dashboard

Automated testing

CI/CD pipeline

Production deployment

Monitoring and error tracking

License

This project is intended for educational, portfolio and demonstration purposes.

If you reuse the project or its assets, make sure you have the appropriate rights to use any third-party images, logos, fonts or other copyrighted material.

Author

Shiva / Sambasivarao Ambati

GitHub: https://github.com/190032106

Quick Start – If You Already Know the Basics

For an experienced developer, the complete setup is:

git clone https://github.com/190032106/IndiTribe-Crafts.git
cd IndiTribe-Crafts
npm install

Create .env from .env.example, configure your Supabase credentials, apply the migrations, then run:

npm run dev

For a production check:

npm run lint
npm run build