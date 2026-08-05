# Goal Planner MVP — Implementation Plan

## 1. Product summary

Build a goal-planning web application where users can:

- Enter a goal and generate an actionable plan with estimated time.
- Ask the AI to generate contextual questions before creating or updating a plan.
- Break any plan step into smaller steps whose estimated time adds up to the parent step.
- Repeat this breakdown recursively, up to 10 step levels.
- Add context and regenerate the children of any step.
- Mark steps complete with automatic parent/child completion propagation.
- See time-weighted progress for each plan.
- Try the complete planner before signing in with temporary browser-session plans, eight lifetime AI actions, and three breakdown levels.
- Sign in with Google, save multiple private plans, and return to them later.
- Track daily completion activity with a GitHub-style contribution grid and streaks.

## 2. MVP defaults

Unless changed before implementation, use these product decisions:

- Product name: **Goal Planner**
- Primary infrastructure region: Singapore or the closest available region
- Visual direction: clean, calm, modern, and productivity-focused
- Authentication: Google only
- Plans: private to their owner
- Guest access: Supabase anonymous session for quota enforcement, browser-session plan storage, eight lifetime generation actions, and three step levels
- Registered AI quota: 200 generation actions per user per day
- Maximum step depth: 10 levels; the plan itself is not counted as a step level
- Progress: time-weighted across active leaf steps
- Streak: at least one user-initiated completion on a local calendar day
- Payments, teams, sharing, notifications, and native apps: out of MVP scope
- Deployment: Vercel preview URL first; custom domain can be added later

## 3. Recommended technology stack

| Layer | Choice | Purpose |
| --- | --- | --- |
| Application | Next.js App Router and TypeScript | UI, authenticated routes, server endpoints, and rendering in one codebase |
| Styling | Tailwind CSS, shadcn/ui, and Lucide icons | Fast, accessible, customizable UI implementation |
| Database | Supabase Postgres | Relational tree storage, transactions, migrations, and reporting |
| Authentication | Supabase Auth with anonymous users and Google OAuth | Guest quota identity, Google sign-in, and cookie-based sessions |
| AI | OpenAI Responses API | Plan, question, and breakdown generation |
| AI validation | Zod and OpenAI Structured Outputs | Typed, schema-constrained model responses |
| Default model | `gpt-5.6-terra`, low reasoning effort | Balance of plan quality, latency, and cost; configurable by environment variable |
| Hosting | Vercel | Next.js deployments, previews, functions, logs, and environment variables |
| Unit tests | Vitest and Testing Library | Business rules and UI behavior |
| Browser tests | Playwright | Critical end-to-end user journeys |

This architecture intentionally avoids a separate API server, Redis, a vector database, and a second authentication vendor for the MVP.

## 4. Application routes and primary user flow

### Public routes

- `/` — landing page and goal input
- `/login` — Google login for returning users
- `/auth/callback` — Supabase OAuth callback
- `/plans/new` — contextual questions and first plan generation for guests or registered users
- `/plans/[planId]` — recursive plan editor for guests or registered users

### Registered-user routes

- `/plans` — list of saved plans, overall activity, and create-plan CTA
- `/plans/import` — import a temporary plan when a returning user signs in
- `/settings` — profile, timezone, and account controls

### Main flow

1. User enters a goal. If no session exists, the app silently creates a Supabase anonymous user.
2. The AI generates three context questions, then creates the first level of the plan from the answers.
3. The temporary plan is kept in browser session storage and is cleared when the user returns home.
4. The user can complete steps, add context, regenerate, and break steps down through level three.
5. “Sign in” snapshots the current plan locally, ends the anonymous session, and starts normal Google OAuth.
6. After Google resolves a new or returning account, the browser snapshot is copied into that account and removed.
7. Registered users can create multiple plans and continue through level ten.

## 5. Data model

### `profiles`

- `id` — UUID matching `auth.users.id`
- `display_name`
- `avatar_url`
- `timezone`
- `created_at`
- `updated_at`

### `plans`

- `id`
- `user_id`
- `goal`
- `emoji` — AI-selected at creation and editable by the user
- `title`
- `summary`
- `status` — active or archived
- `created_at`
- `updated_at`

### `steps`

- `id`
- `plan_id`
- `user_id` — duplicated intentionally to make ownership policies simple and efficient
- `parent_id` — null for top-level steps
- `generation_id`
- `depth` — constrained to 1 through 10
- `position`
- `title`
- `description`
- `estimated_minutes`
- `is_completed`
- `completed_at`
- `archived_at` — non-null when replaced by regeneration
- `created_at`
- `updated_at`

### `context_questions`

- `id`
- `plan_id`
- `target_step_id` — null when the questions apply to the whole plan
- `generation_id`
- `question`
- `answer`
- `position`
- `created_at`

### `ai_generations`

- `id`
- `plan_id`
- `target_step_id`
- `user_id`
- `kind` — plan, questions, breakdown, or regeneration
- `model`
- `prompt_version`
- `status` — pending, completed, or failed
- `input_tokens`
- `output_tokens`
- `error_code`
- `created_at`
- `completed_at`

### `completion_events`

- `id`
- `user_id`
- `plan_id`
- `step_id`
- `source` — manual, cascade, or automatic-parent
- `local_date`
- `created_at`

Only manual events contribute to streak continuation and grid intensity. A manual parent completion creates one manual event; its cascaded descendants do not inflate activity.

### `daily_ai_usage`

- `user_id`
- `usage_date`
- `generation_count`

An atomic Postgres function increments this counter and rejects requests beyond the configured daily limit.

### `guest_ai_usage`

- `user_id`
- `generation_count`
- `created_at`
- `updated_at`

The database applies the eight-action guest limit for the anonymous user's lifetime and enforces a maximum generated step depth of three. Anonymous plan content is not written to the database. The limit is selected inside the database function and cannot be raised by a browser caller.

## 6. Tree and completion rules

### Depth

- Top-level steps have depth 1.
- A child always has `parent.depth + 1`.
- The database and application both reject children deeper than level 10.
- The UI disables “Break it down” at level 10.

### Completion propagation

- Checking a parent checks all active descendants.
- Unchecking a parent unchecks all active descendants.
- Checking or unchecking a child recomputes every active ancestor.
- A parent with children is complete only when all its active immediate children are complete.
- Completion propagation executes in one database transaction through an authenticated Postgres function.
- The function verifies that the target step belongs to the current authenticated user.

### Progress

Only active leaf steps contribute to progress:

```text
completed active leaf minutes / total active leaf minutes
```

This prevents the progress percentage from changing merely because one step was divided into several smaller steps.

### Time estimates

- The plan total equals the sum of active top-level steps.
- When a step is broken down, the sum of its active immediate children must equal the parent's stored estimate.
- The server proportionally normalizes and rounds model-provided estimates.
- Any rounding remainder is applied deterministically so the invariant is exact.

### Regeneration

- Regeneration creates a new generation record.
- The replaced active child subtree is soft-archived, not permanently deleted.
- New children begin incomplete.
- Archived nodes no longer affect progress or parent completion.
- Completion events remain available for historical activity reporting.
- Duplicate requests are prevented with an idempotency key and an active-generation lock per target.

## 7. AI operations

### Generate a plan

Input:

- Goal
- Optional user context and answers
- Output constraints and time-estimation instructions

Output:

- Plan title
- Short summary
- Assumptions
- Ordered first-level steps with title, description, and estimated minutes

### Generate context questions

Input:

- Goal and current plan summary
- Target step and its ancestor path when scoped to a step
- Existing relevant answers

Output:

- Three to six concise, non-redundant questions that materially affect the plan

### Break down or regenerate a step

Input:

- Goal and plan summary
- Target step and ancestor path
- Target estimated minutes
- Relevant questions and answers

Output:

- Two to eight ordered child steps
- Each child contains a title, useful description, and estimated minutes

The model generates only one new level per request. IDs, ownership, depth, ordering constraints, completion state, archival, and authoritative time normalization are controlled by the application and database.

## 8. AI safety, reliability, and cost controls

- Keep `OPENAI_API_KEY` server-only.
- Require an authenticated user for AI requests.
- Validate all request bodies and model outputs with Zod.
- Use OpenAI Structured Outputs rather than parsing free-form JSON.
- Use `store: false`; Supabase is the application source of truth.
- Send a stable, privacy-preserving `safety_identifier` derived from the user ID.
- Enforce goal, context, question-answer, and output size limits.
- Use a configurable per-user daily quota, defaulting to 200 AI actions.
- Prevent duplicate concurrent generations for the same plan or step.
- Retry once only for eligible transient provider errors.
- Record generation status and token usage without logging secrets or full sensitive prompts.
- Provide clear loading, refusal, timeout, quota, and retry UI states.
- Keep the selected model in `OPENAI_MODEL` so it can be changed without a deployment code change.

## 9. Security and privacy

- Enable Row Level Security on every exposed Supabase table.
- Restrict all plan data to `(select auth.uid()) = user_id`.
- Validate ownership again inside security-definer transaction functions.
- Give database functions a fixed safe `search_path` and only required privileges.
- Do not expose a Supabase service-role key to the browser.
- Do not use an unverified session object for authorization decisions.
- Use secure cookie-based SSR authentication.
- Avoid caching authenticated responses containing session refresh headers.
- Keep plans private by default.
- Include basic privacy and terms placeholders before public launch.

## 10. Streak and activity design

- Capture the browser's IANA timezone on first authenticated use and allow the user to change it.
- A streak day is a local calendar day containing at least one manual completion event.
- Current streak counts backward from today, or from yesterday when today has no completion yet.
- Longest streak is computed from historical active days.
- The contribution grid shows the most recent 365 days.
- Grid intensity is based on the number of manual completions that day.
- Automatic parent completion and descendant cascades do not add grid intensity.

## 11. Implementation phases

### Phase 1 — Foundation

- Initialize Git.
- Scaffold the latest stable Next.js TypeScript application.
- Configure Tailwind, shadcn/ui, linting, formatting, Vitest, and Playwright.
- Create layouts, design tokens, navigation, loading states, and `.env.example`.

### Phase 2 — Database and authentication

- Initialize Supabase migrations and local configuration.
- Create tables, indexes, constraints, RLS policies, and database functions.
- Generate TypeScript database types.
- Build Supabase browser/server clients and session refresh proxy.
- Add Google login, callback, logout, protected routes, and profile creation.

### Phase 3 — Initial plan generation

- Build goal entry and authentication handoff.
- Implement the plan-generation endpoint and typed AI schema.
- Persist generation state and first-level steps.
- Build plan dashboard and initial plan view.

### Phase 4 — Recursive planning

- Build the recursive, collapsible step UI.
- Add breakdown, context-question, answer, and regeneration flows.
- Enforce time, depth, idempotency, and generation-version rules.
- Add optimistic and error recovery states.

### Phase 5 — Completion, progress, and streaks

- Connect checkbox actions to the transactional completion function.
- Add time-weighted plan progress.
- Capture timezone and store activity events.
- Build current streak, longest streak, and 365-day activity grid.

### Phase 6 — Hardening and deployment

- Complete unit, integration, RLS, and browser tests.
- Run accessibility and responsive-layout checks.
- Add production-safe logging and error handling.
- Deploy a Vercel preview.
- Configure Supabase and Google redirect URLs.
- Perform live Google OAuth and OpenAI smoke tests.
- Deploy to production and document operations.

## 12. Testing and acceptance criteria

The MVP is complete when a user can:

- Sign in and out using Google.
- Create, list, open, archive, and delete their own plans.
- Generate an initial plan from a goal.
- Generate useful context questions and submit answers.
- Regenerate a plan or the children of any eligible step.
- Break steps down recursively to level 10, but not level 11.
- See child estimates add up exactly to their parent estimate.
- Check or uncheck parents and children with correct propagation.
- See accurate time-weighted plan progress.
- See persisted activity and correct timezone-aware streaks.
- Reload or return later without losing saved state.
- Never read or mutate another user's data.
- Recover cleanly from AI failures, timeouts, duplicate requests, and quota limits.

Automated coverage must include:

- Time normalization and rounding.
- Depth enforcement.
- Completion propagation in both directions.
- Progress invariance before and after breakdown.
- Regeneration and soft archival.
- Streak date boundaries and cascade exclusions.
- AI output validation and error mapping.
- Cross-user RLS isolation.
- The critical end-to-end create, generate, break down, complete, and reload journey.

## 13. Environment contract

The repository will contain a safe `.env.example`. Local secrets go in an ignored `.env.local` file:

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The application runtime should not require a Supabase service-role key. Supabase and Vercel CLI authentication is separate from runtime environment variables.

Google's OAuth Client ID and Client Secret belong in the Supabase Google provider configuration, not in browser-exposed application variables.

## 14. What can be built before credentials exist

The following work is not blocked by missing accounts or secrets:

- Entire Next.js scaffold and visual design.
- All pages and recursive tree interactions.
- Database migrations, RLS policies, functions, and generated local types.
- Supabase and OpenAI adapter interfaces.
- AI prompts, Zod schemas, and deterministic time normalization.
- A fake AI provider for local development and automated tests.
- Completion, progress, regeneration, quota, and streak business logic.
- Unit, component, database, and browser test suites.
- Environment validation and deployment configuration.
- Documentation and setup scripts.

The app should support a deliberate development mode using deterministic fake AI responses. It must fail with a clear setup message rather than crash when live credentials are absent.

## 15. Credential-dependent work and blockers

There are no blockers to starting the implementation.

The following cannot be completed or verified until the corresponding external configuration exists:

| Dependency | Work that remains blocked without it |
| --- | --- |
| OpenAI API key with billing | Live plan generation, provider error testing, token usage verification, and real output-quality evaluation |
| Hosted Supabase project | Applying remote migrations and verifying the deployed database/Auth configuration |
| Google OAuth client | Live Google login and consent-screen testing |
| Vercel account/project | Preview and production deployments and production environment variables |
| Final deployment URL | Final Supabase redirect allowlist and Google authorized origin configuration |
| Custom domain and DNS access | Custom-domain launch only; it does not block a Vercel URL deployment |

These dependencies can be added near the end. Until then, implementation and automated verification can proceed with a local Supabase instance where available and deterministic provider fakes.

## 16. Inputs needed before live integration

- Confirm or change the defaults in section 2.
- Create an OpenAI API key with billing and place it in `.env.local`; never paste it into chat.
- Create or select the Supabase project and authenticate the Supabase CLI.
- Create a Google Web OAuth client and configure the Supabase callback URL.
- Authenticate the Vercel CLI or connect the Git repository to Vercel.
- Optionally provide the final product name, logo, custom domain, and legal copy.

## 17. Official references

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase server-side authentication for Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework)
- [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL recursive queries](https://www.postgresql.org/docs/17/queries-with.html)
- [OpenAI Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
