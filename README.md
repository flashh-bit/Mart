# Retail Shop

A high-performance modern e-commerce storefront with a secure admin dashboard, powered by React, Express, and Supabase.

## Features
- **Stateless Authentication**: Admin sessions use JWT tokens and persist safely across server restarts.
- **Supabase PostgreSQL**: Fully decoupled database with Row Level Security.
- **Supabase Storage**: In-memory direct upload to cloud storage for product images.
- **Security-First**: Content-Security-Policy headers, rate-limiting, and strict backend routing.
- **Automated Keepalive**: Included GitHub Actions workflow to prevent server sleep on free tiers.

## Quickstart

**Prerequisites:**  Node.js (v18+)

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor**, and run the query found in `supabase/migrations/01_schema.sql`.
3. Go to **Storage**, and create a new **public** bucket named `product-images`.

### 2. Environment Configuration
1. Rename `.env.example` to `.env`.
2. Generate an admin password hash by running: `npm run hash-password`
3. Generate a secure random string and assign it to `SESSION_SECRET`.
4. Copy your Supabase Project URL and the **Service Role Secret Key** (`sb_secret_...`) from your Supabase Dashboard (Settings -> API) into `.env`.

### 3. Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Seed the initial database (only run once):
   ```bash
   npm run seed
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Production Deployment
Ensure that the environment variables from your `.env` file are securely added to your hosting provider (Vercel, Render, Railway, etc.). 

To enable the automated keepalive ping, set the `KEEPALIVE_URL` (e.g., `https://your-domain.com/api/health`) as a Repository Secret in GitHub Settings -> Secrets and variables -> Actions.
