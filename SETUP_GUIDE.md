# Holiday House Sitters - Setup Guide

This guide will help you set up and deploy the Holiday House Sitters application.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Maps**: Leaflet with OpenStreetMap

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- (Optional) Stripe account for payments

---

## Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon/Public key
   - Project ID

3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"
```

### 3. Run Database Migrations

Using Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

Or manually run each SQL file in `supabase/migrations/` through the Supabase SQL Editor (in order by filename).

### 4. Deploy Edge Functions

```bash
supabase functions deploy chat
supabase functions deploy check-subscription
supabase functions deploy create-checkout
supabase functions deploy geocode
supabase functions deploy get-pending-users
```

### 5. Configure Edge Function Secrets

In Supabase Dashboard → Edge Functions → Secrets, add:

- `STRIPE_SECRET_KEY` - Your Stripe secret key (for payments)
- `OPENAI_API_KEY` - For the AI chatbot (or use Lovable AI)

### 6. Set Up Storage Bucket

In Supabase Dashboard → Storage:

1. Create a bucket named `identity-documents`
2. Set it to **Private**
3. The RLS policies from migrations will handle access control

### 7. Configure Authentication

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:8080` (for local) or your production URL
- **Redirect URLs**: Add your domain(s)

### 8. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:8080`

---

## Production Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Option 2: Netlify

1. Push code to GitHub
2. Connect repo to [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Option 3: Self-Hosted

```bash
npm run build
# Serve the `dist` folder with any static file server
```

---

## Database Schema Overview

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with verification status |
| `listings` | House sit listings created by homeowners |
| `bookings` | Applications from sitters to listings |
| `messages` | Chat messages between booking participants |
| `user_roles` | Role assignments (admin, homeowner, sitter, vet_nurse) |
| `verification_logs` | Admin verification audit trail |
| `pending_admin_requests` | Queue for admin signup approvals |

---

## User Roles

1. **Homeowner** - Creates house sit listings, requires payment ($75/year)
2. **Sitter** - Applies to listings, no payment required
3. **Vet Nurse** - Provides pet support services, no payment required
4. **Admin** - Verifies users, manages platform

---

## Key Features

- ✅ User registration with role selection
- ✅ Document upload for verification
- ✅ Admin verification workflow
- ✅ Stripe payment integration
- ✅ House sit listing creation
- ✅ Sitter application system
- ✅ In-app messaging
- ✅ Map-based discovery (Leaflet/OpenStreetMap)
- ✅ AI chatbot for support
- ✅ Rate limiting on public endpoints

---

## Stripe Setup (Payments)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from Stripe Dashboard
3. Add `STRIPE_SECRET_KEY` to Supabase Edge Function secrets
4. Create a product/price for the $75/year membership
5. Update the price ID in `supabase/functions/create-checkout/index.ts`

---

## Troubleshooting

### "Invalid API key" errors
- Verify `.env` variables match your Supabase project
- Ensure you're using the anon key, not the service role key

### RLS policy errors
- Run all migrations in order
- Check that RLS is enabled on all tables

### Edge functions not working
- Verify functions are deployed: `supabase functions list`
- Check secrets are configured in Supabase dashboard
- Review function logs in Supabase dashboard

### Auth redirect issues
- Ensure Site URL and Redirect URLs are configured in Supabase Auth settings

---

## Support

For questions about the codebase, refer to:
- `/src/pages/` - Page components
- `/src/components/` - Reusable UI components
- `/supabase/functions/` - Backend logic
- `/supabase/migrations/` - Database schema

---

## License

[Add your license here]
