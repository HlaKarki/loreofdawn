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
- **Next.js 15** with React 19 and TypeScript
- **TailwindCSS v4** for styling
- **shadcn/ui** component library
- **Clerk** for authentication

### Backend
- **Cloudflare Workers** - Edge API with global caching
- **Hono** - Lightweight, high-performance server framework
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
│   ├── web/         # Next.js frontend
│   ├── worker/      # Cloudflare Workers edge API
│   ├── server/      # Sync server for data pipeline
│   └── crons/       # Scheduled tasks for data updates
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

# Push database schema
cd packages/database
bun db:push
```

### Development

```bash
# Run all apps in development mode
bun dev

# Or run individual apps
bun dev:web      # Frontend (http://localhost:1201)
bun dev:worker   # Worker API (http://localhost:8788)
bun dev:server   # Sync server (http://localhost:3000)
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
- `NEXT_PUBLIC_SERVER_URL` - Worker API endpoint
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key

### Worker (`apps/worker/.dev.vars`)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `CLERK_SECRET_KEY` - Clerk authentication
- `STRIPE_SECRET_KEY` - Stripe payments
- `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` - Local DB connection

## Deployment

### Frontend (Railway)

### Worker (Cloudflare)
```bash
cd apps/worker
wrangler deploy
```
