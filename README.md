# SMART Goal

SMART Goal turns a rough ambition into an editable SMART goal and a practical, time-estimated plan. Users can add context, regenerate a plan, recursively break down any step to ten levels, track time-weighted progress, and build a daily completion streak.

The repository is intentionally usable before external accounts are connected. With no Supabase or OpenAI credentials, it runs as a deterministic browser-local demo with the complete planning flow.

## What is implemented

- Responsive landing page, dashboard, new-plan flow, and recursive planner.
- Deterministic development AI plus a live OpenAI Responses API provider.
- Structured Outputs validated with Zod.
- Whole-plan and step-level clarification questions.
- AI-selected plan emojis with an editable emoji picker.
- Recursive breakdown to ten levels.
- Child estimates normalized to equal the parent time exactly.
- Bidirectional completion propagation.
- Time-weighted progress based on active leaf steps.
- Soft-archived regeneration history.
- Multiple private plans, archive, restore, and delete controls.
- GitHub-style 365-day activity grid with current and longest streaks.
- Supabase Google OAuth integration and cookie-based SSR sessions.
- Anonymous planning with browser-session plans, eight lifetime AI actions, and three breakdown levels before sign-in.
- One Google sign-in flow that imports the current temporary plan into either a new or returning account.
- Postgres migrations, Row Level Security, server-selected guest/daily quotas, tree validation, and transactional completion updates.
- Unit tests, browser tests, production build verification, and GitHub Actions CI.

The detailed product and architecture specification lives in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4 with a custom SMART Goal design system
- Supabase Postgres and Auth
- OpenAI Responses API with `gpt-5.6-terra` by default
- Vitest, Testing Library, and Playwright
- Vercel-ready deployment

## Quick start in demo mode

Requirements: Node.js 24 and pnpm 11.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). When `OPENAI_API_KEY` and the Supabase public variables are empty, development uses deterministic AI responses and browser `localStorage`.

Demo mode is visibly labeled. It should not be enabled on a public production deployment.

## Environment variables

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
GOAL_PLANNER_ENABLE_DEMO=false

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

LEGAL_CONTACT_EMAIL=contact@goal-planner.com
```

`OPENAI_API_KEY` is read only in server route handlers. The application does not need a Supabase service-role key at runtime.

`LEGAL_CONTACT_EMAIL` is not a secret. It is displayed as the contact link on the Terms and Privacy pages and defaults to `contact@goal-planner.com`.

## Connect Supabase

1. Create a Supabase project in the region closest to the primary audience.
2. Install or invoke the Supabase CLI and authenticate:

   ```bash
   pnpm dlx supabase@latest login
   pnpm dlx supabase@latest link --project-ref YOUR_PROJECT_REF
   pnpm dlx supabase@latest db push
   ```

3. Copy the Project URL and publishable key from the Supabase Connect dialog into `.env.local`.
4. In Authentication settings, enable Anonymous Sign-Ins.
5. Restart the development server.

The migrations create all tables, indexes, constraints, RLS policies, profile trigger, registered and guest quota functions, guest depth limits, anonymous-plan storage protection, anonymous-user cleanup helper, and completion transaction.

Before a public launch, configure Cloudflare Turnstile or hCaptcha in Supabase Authentication → Bot and Abuse Protection. Anonymous sign-in has a built-in IP rate limit, but CAPTCHA provides important protection against distributed account creation and AI quota abuse.

### Configure Google login

1. In Google Cloud, create a Web OAuth client.
2. Add the application's origin, such as `http://localhost:3000`, to Authorized JavaScript origins.
3. Add Supabase's callback URL to Authorized redirect URIs:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

4. In Supabase Authentication → Providers → Google, enable the provider and add the Google Client ID and Client Secret.
5. In Supabase Authentication → URL Configuration, set the Site URL and allow the app's `/auth/callback` URL.
6. Test the guest “Sign in” flow with both a new Google account and a returning account.

For production, repeat the origin and redirect allowlist setup with the final Vercel URL or custom domain.

## Connect OpenAI

Add a server-side API key to `.env.local`:

```dotenv
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-terra
GOAL_PLANNER_ENABLE_DEMO=false
```

The integration uses:

- `openai.responses.parse`
- Zod Structured Outputs
- low reasoning effort
- `store: false`
- a privacy-preserving hashed `safety_identifier`
- server-selected guest lifetime and registered daily quota enforcement

The prompt and output contracts live in `src/lib/ai`.

## Deploy to Vercel

1. Import this GitHub repository into Vercel or run `pnpm dlx vercel@latest`.
2. Add the five production environment variables from `.env.example`.
3. Do not set `GOAL_PLANNER_ENABLE_DEMO=true` for a public deployment.
4. Deploy once to obtain the production URL.
5. Add that URL to the Supabase redirect allowlist and Google authorized origins.
6. Perform a Google login and live generation smoke test.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local app |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Check TypeScript |
| `pnpm test` | Run domain unit tests |
| `pnpm test:e2e` | Run Chromium browser tests |
| `pnpm build` | Create a production build |
| `pnpm check` | Run lint, types, unit tests, and build |

Install the Playwright browser once before the first local end-to-end run:

```bash
pnpm exec playwright install chromium
```

## Important behavioral rules

- Top-level steps are depth 1; depth 10 is the final allowed layer.
- A parent click applies to its entire active subtree.
- A parent becomes complete only when all active immediate children are complete.
- Active leaf minutes are the only inputs to progress, preventing double counting.
- Generated child estimates are normalized to equal the parent's time exactly.
- Regeneration archives the replaced active subtree and creates a new generation.
- Streaks count user-initiated completions, not automatic ancestor or descendant changes.
- Plans are private and protected by `auth.uid()` RLS policies.
- Anonymous plans live only in the current tab's browser session and are cleared on returning home. Guests can start another plan without a plan-count cap, while the anonymous account retains its eight lifetime AI-action limit and three-level breakdown limit.
- Signing in copies the current temporary plan into the Google account selected by Supabase, then clears the browser handoff copy.
- Schedule `select public.delete_expired_anonymous_users();` weekly in Supabase Cron to remove abandoned anonymous accounts older than 30 days.

## Current credential boundary

The codebase, deterministic demo, unit tests, browser tests, and production build work without external accounts. These items still require credentials before launch:

- Applying the migration to hosted Supabase.
- Live Google OAuth validation.
- Live OpenAI quality, latency, and usage validation.
- Vercel preview and production deployment.
- Final redirect and custom-domain configuration.
