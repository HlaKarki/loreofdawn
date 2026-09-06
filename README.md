# Lore of Dawn

A comprehensive Mobile Legends companion platform that combines real-time hero analytics with curated lore content. Built to help players make data-driven decisions and explore the rich storytelling universe of Mobile Legends: Bang Bang.

**Live:** [loreofdawn.com](https://loreofdawn.com)

## Features

### Hero Analytics
- **Live Meta Statistics** - Real-time win rates, pick rates, and ban rates by rank
- **Hero Matchups** - Data-driven counter picks and synergies
- **Performance Tracking** - Historical trends and quadrant visualizations
- **Advanced Filtering** - Search by role, lane, difficulty, and performance metrics

### Lore Library
- **Complete Hero Stories** - All hero backstories in an organized, readable format
- **Smart Tagging** - AI-powered metadata for moods, themes, and character relationships
- **Featured Content** - Hero of the day and curated story recommendations
- **Search & Discovery** - Find stories by mood, theme, or character connections

### AI Assistant
- **Natural Language Queries** - Ask questions about heroes, meta, and matchups
- **Data-Backed Answers** - Powered by live database statistics
- **Credit System** - Stripe-integrated monetization with account tiers

## Tech Stack

### Frontend
- **TanStack Start** (React 19, Vite) on Cloudflare Workers with TypeScript
- **TailwindCSS v4** for styling
- **shadcn/ui** component library
- **Clerk** for authentication

### Backend
- **Cloudflare Workers** - Edge API with global caching
- **Hono** - Lightweight, high-performance server framework
- **ML stats sync** - 3-hourly cron in the Worker pulls hero stats from the game API into Supabase, then reseeds KV
- **Drizzle ORM** with PostgreSQL (Supabase)
- **Cloudflare Hyperdrive** - Connection pooling and query acceleration
- **Cloudflare KV** - Edge caching layer
- **Durable Objects** - Rate limiting

### Data Pipeline
- **Automated Cron Jobs** - Regular data synchronization
- **API Integration** - Mobile Legends Wiki and game data APIs
- **Content Processing** - AI-powered metadata extraction and tagging

### Payments
- **Stripe** - Subscription management with webhooks

## Project Structure

```
loreofdawn/
├── apps/
│   ├── web/         # TanStack Start frontend (Cloudflare Worker)
│   └── worker/      # Cloudflare Workers edge API + ML stats sync cron
├── packages/
│   ├── database/    # Drizzle schema and types
│   └── utils/       # Shared utilities
```

## Getting Started

### Prerequisites
- Bun runtime
- PostgreSQL database (or Supabase account)
- Cloudflare account (for Workers deployment)

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp apps/web/.env.example apps/web/.env
cp apps/worker/.dev.vars.example apps/worker/.dev.vars

# Push database schema (packages/database reads DATABASE_URL)
bun db:push
```

### Development

```bash
# Run all apps in development mode
bun dev

# Or run individual apps
bun dev:web      # Frontend (http://localhost:1201)
bun dev:worker   # Worker API (http://localhost:8788)
```

### ML stats sync

The Worker's cron (`0 */3 * * *`) runs the ML sync and then reseeds KV. Trigger a run by hand with:

```bash
curl -X POST https://cf-api.loreofdawn.com/internal/sync -H "Authorization: Bearer $SYNC_SECRET_TOKEN"
```

### Database

```bash
# Generate migrations
bun db:generate

# Apply migrations
bun db:push

# Open Drizzle Studio
bun db:studio
```

## Environment Variables

### Web (`apps/web/.env`)
- `VITE_SERVER_URL` - Worker API endpoint
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key (in `apps/web/.dev.vars` locally, a Worker secret in production)

### Worker (`apps/worker/.dev.vars`)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `CLERK_SECRET_KEY` - Clerk authentication
- `STRIPE_SECRET_KEY` - Stripe payments
- `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` - Local DB connection
- `ML_BASE_URL`, `ML_FIRST_ID`, `ML_SECOND_ID_{HERO,MATCHUP,META,GRAPH}` - ML stats API endpoints for the sync cron
- `SYNC_SECRET_TOKEN` - Bearer token for `POST /internal/sync`

## Deployment

### Frontend (Cloudflare Workers)
```bash
cd apps/web
bun run deploy
```

### Worker (Cloudflare)
```bash
cd apps/worker
wrangler deploy
```
