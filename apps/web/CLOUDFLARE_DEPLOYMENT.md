# Deploying Next.js to Cloudflare Workers

> **Guide created:** November 2025
> **Next.js version:** 15.5.0
> **@opennextjs/cloudflare version:** ^1.13.0

This guide documents the process of deploying a Next.js application to Cloudflare Workers using `@opennextjs/cloudflare`.

---

## Table of Contents

- [Why Cloudflare Workers?](#why-cloudflare-workers)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Common Issues & Solutions](#common-issues--solutions)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Known Limitations](#known-limitations)
- [Useful Commands](#useful-commands)

---

## Why Cloudflare Workers?

### ✅ Benefits

- **Unified infrastructure** - Deploy frontend + API on same platform
- **Global edge network** - Low latency worldwide
- **Cost-effective** - Generous free tier
- **Workers + Assets** - Static assets served from edge
- **Node.js runtime support** - More Next.js features than edge runtime

### ❌ vs Vercel

- Some Next.js features limited (ISR, Middleware quirks)
- No automatic image optimization
- Requires manual setup
- Beta stability (as of Nov 2025)

### @opennextjs/cloudflare vs @cloudflare/next-on-pages

| Feature | @opennextjs/cloudflare | @cloudflare/next-on-pages |
|---------|------------------------|---------------------------|
| Runtime | Node.js (nodejs_compat) | Edge only |
| Features | More Next.js features | Limited |
| Status | **Recommended** (2025) | Legacy |
| Stability | Beta | Stable but limited |

**Use `@opennextjs/cloudflare`** - it's the official recommended approach as of 2025.

---

## Prerequisites

1. **Cloudflare account** with Workers access
2. **Node.js** 20+ or Bun 1.3+
3. **Next.js** 15+ application
4. **Git** for version control

---

## Installation

### 1. Install dependencies

```bash
# Add to devDependencies
bun add -D @opennextjs/cloudflare@latest wrangler@latest

# or npm/pnpm
npm install -D @opennextjs/cloudflare@latest wrangler@latest
```

**Important version requirements:**
- `@opennextjs/cloudflare`: ^1.12.0 or later
- `wrangler`: ^4.47.0 or later (peer dependency)

### 2. Add npm scripts

Add to `package.json`:

```json
{
  "scripts": {
    "pages:build": "opennextjs-cloudflare build",
    "pages:deploy": "opennextjs-cloudflare deploy",
    "pages:dev": "opennextjs-cloudflare preview"
  }
}
```

---

## Configuration

### 1. Create `wrangler.jsonc`

```jsonc
{
  "name": "your-app-name",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

**Key points:**
- `nodejs_compat` flag is **required**
- Compatibility date must be `2024-09-23` or later
- Output goes to `.open-next/` directory

### 2. Create `open-next.config.ts`

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
```

**For advanced caching (optional):**

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
```

### 3. Update `next.config.ts`

Add experimental server actions support:

```typescript
const nextConfig: NextConfig = {
  // ... your existing config
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};
```

### 4. Update `.gitignore`

```gitignore
# Cloudflare build output
.wrangler
.dev.vars*
.open-next
```

---

## Common Issues & Solutions

### Issue #1: MDX/Code Generation Errors

**Error:**
```
EvalError: Code generation from strings disallowed for this context
```

**Cause:** Cloudflare Workers block `eval()` for security. Libraries like `next-mdx-remote` use `eval()` internally.

**Solution:** Use `react-markdown` instead:

```typescript
// ❌ Don't use
import { compileMDX } from "next-mdx-remote/rsc";

// ✅ Use instead
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// In your component:
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {markdown}
</ReactMarkdown>
```

### Issue #2: Command Not Found Errors

**Error:**
```
opennextjs-cloudflare: command not found
```

**Solutions:**

1. **Check version** - Must be v1.12.0+:
   ```bash
   bun add -D @opennextjs/cloudflare@latest
   ```

2. **Use correct command syntax:**
   ```bash
   opennextjs-cloudflare build  # ✅ Correct
   opennextjs-cloudflare        # ❌ Missing command
   ```

### Issue #3: TypeScript Errors with Config

**Error:**
```
Cannot find module 'open-next/types/open-next'
```

**Cause:** Old configuration syntax from outdated docs.

**Solution:** Use modern config:

```typescript
// ❌ Old (0.3.x)
import type { OpenNextConfig } from "open-next/types/open-next";

// ✅ New (1.12.0+)
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

### Issue #4: Wrangler Peer Dependency Warning

**Warning:**
```
incorrect peer dependency "wrangler@4.47.0"
```

**Solution:** Upgrade wrangler:

```bash
bun add -D wrangler@latest
```

### Issue #5: Image Optimization Errors

**Error:** Next.js Image component fails to load external images.

**Solution:** Add domains to `next.config.ts` AND ensure images work without optimization:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "*.example.com",
        protocol: "https",
        pathname: "/**",
      },
    ],
  },
};
```

Use `unoptimized` prop if needed:
```tsx
<Image src={url} alt="" unoptimized />
```

---

## Deployment

### Local Preview

Test your build locally before deploying:

```bash
# Build the app
bun run pages:build

# Preview with Wrangler
bun run pages:dev
```

Visit `http://localhost:8788` (default Wrangler port)

### Deploy to Production

#### First-time deployment

```bash
# Login to Cloudflare (one-time)
bunx wrangler login

# Build and deploy
bun run pages:deploy
```

**You'll be prompted to:**
1. Create a new project or select existing
2. Choose a subdomain (e.g., `your-app.workers.dev`)

#### Subsequent deployments

```bash
bun run pages:deploy
```

### Deployment via CI/CD (GitHub Actions)

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build and deploy
        run: bun run pages:deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**To get API token:**
1. Cloudflare Dashboard → My Profile → API Tokens
2. Create Token → Edit Cloudflare Workers template
3. Add to GitHub Secrets as `CLOUDFLARE_API_TOKEN`

---

## Environment Variables

### Adding Environment Variables

**Via Cloudflare Dashboard:**
1. Workers & Pages → Your project
2. Settings → Environment variables
3. Add variables for Production/Preview

**Via `wrangler.toml`:**

```toml
[env.production.vars]
API_URL = "https://api.example.com"
NEXT_PUBLIC_SITE_URL = "https://example.com"
```

**Important:**
- Prefix with `NEXT_PUBLIC_` for client-side access
- Rebuild/redeploy after changing env vars
- Use `.dev.vars` for local development (gitignored)

### Local Development Variables

Create `.dev.vars` (like `.env.local`):

```bash
API_URL=http://localhost:8787
SECRET_KEY=your-secret
```

---

## Known Limitations

### Features That Don't Work

❌ **Middleware** - Partial support, some features broken
❌ **ISR (Incremental Static Regeneration)** - Limited, needs R2 setup
❌ **Image Optimization** - No automatic optimization like Vercel
❌ **Edge Config** - Vercel-specific feature
❌ **Code using `eval()`** - Blocked by Workers security

### Features That Work

✅ **Server Components** - Full support
✅ **Server Actions** - Full support
✅ **API Routes** - Full support
✅ **Static Generation (SSG)** - Full support
✅ **Server-Side Rendering (SSR)** - Full support
✅ **Dynamic Routes** - Full support
✅ **App Router** - Full support

---

## Useful Commands

```bash
# Build for Cloudflare
bun run pages:build

# Preview locally
bun run pages:dev

# Deploy to production
bun run pages:deploy

# View logs
bunx wrangler tail

# Open dashboard
bunx wrangler open

# Delete deployment
bunx wrangler delete

# View deployment list
bunx wrangler deployments list
```

---

## Project Structure After Build

```
your-app/
├── .open-next/              # Build output (gitignored)
│   ├── worker.js           # Worker entry point
│   ├── assets/             # Static assets
│   └── server-functions/   # Server-side code
├── open-next.config.ts     # OpenNext config
├── wrangler.jsonc          # Wrangler config
├── next.config.ts          # Next.js config
└── package.json
```

---

## Troubleshooting Checklist

Before deploying, verify:

- [ ] `@opennextjs/cloudflare` version is 1.12.0+
- [ ] `wrangler` version is 4.47.0+
- [ ] `wrangler.jsonc` has `nodejs_compat` flag
- [ ] `compatibility_date` is 2024-09-23 or later
- [ ] No `eval()` usage in your code (check MDX, dynamic imports)
- [ ] `.open-next` is in `.gitignore`
- [ ] Environment variables set in Cloudflare dashboard
- [ ] Local preview works (`bun run pages:dev`)

---

## Resources

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js on Cloudflare Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

---

## Version History

| Date | Next.js | @opennextjs/cloudflare | Notes |
|------|---------|------------------------|-------|
| Nov 2025 | 15.5.0 | 1.13.0 | Initial deployment, switched from MDX to ReactMarkdown |

---

## Tips & Best Practices

1. **Start simple** - Deploy basic routes first, add complexity gradually
2. **Test locally** - Always use `pages:dev` before deploying
3. **Monitor logs** - Use `wrangler tail` to debug production issues
4. **Cache wisely** - Set up R2 incremental cache for better performance
5. **Preview branches** - Each git branch gets its own preview URL
6. **Watch bundle size** - Workers have 1MB compressed limit
7. **Use edge sparingly** - Not everything needs to run on the edge

---

**Last updated:** November 19, 2025
