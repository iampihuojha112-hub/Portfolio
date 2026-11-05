# Pihu Ojha — 3D Portfolio (Next.js + Supabase)

Single-page 3D portfolio with a private admin dashboard. Public content is read from Supabase; you manage everything at `/admin`.

> **Honest status.** This code was written in an environment where `npm install` was blocked, so it has **never been compiled, linted or run in a browser**. What *was* verified: the SQL (migrations, seed, RLS) was executed on a real PostgreSQL 16 with 27 passing security checks (see `supabase/tests/`), and the TypeScript was parsed with no syntax errors. Expect to fix a few type or runtime issues on first `npm run build`. Section 8 lists exactly what to smoke-test.

## 1. Stack
Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind v4 · Three.js / React Three Fiber / Drei · Framer Motion · GSAP · Lenis · Supabase (Auth, Postgres, Storage) · Zod.
Dependency versions in `package.json` are caret ranges chosen without registry access; run `npm install` and commit the lockfile.

## 2. Supabase setup
1. Create a project at supabase.com.
2. **Authentication → Providers → Email**: keep Email enabled, and turn **off "Allow new users to sign up"** (no public registration).
3. **Project Settings → API**: copy the Project URL and the `anon` / publishable key.

## 3. Run the migrations (schema, RLS, storage)
In the Supabase **SQL Editor**, run these in order (or use the Supabase CLI: `supabase db push`):
1. `supabase/migrations/0001_schema.sql` — tables, constraints, indexes, triggers
2. `supabase/migrations/0002_rls.sql` — `is_admin()`, Row Level Security, contact + resume functions
3. `supabase/migrations/0003_storage.sql` — `portfolio` bucket (10 MB limit; jpg/png/webp/avif/pdf) + admin-only write policies
4. `supabase/seed.sql` — only the information you provided (see "Content" below)

## 4. Create your admin account
1. **Authentication → Users → Add user**, enter your email and a strong password, tick **Auto Confirm User**.
2. In the SQL Editor authorize that email (lowercase):
   ```sql
   insert into public.admin_users (email) values ('you@example.com');
   ```
3. Visit `/admin/login`. Anyone else who somehow signs in is rejected server-side and by RLS.
4. Verify security: run `supabase/tests/rls_checks.sql` in the SQL editor — every row must say PASS.

## 5. Environment variables
```bash
cp .env.example .env.local
```
Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, and `CONTACT_HASH_SALT` (`openssl rand -hex 32`). **No service-role key is used anywhere.**

## 6. Local development
```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

## 7. Deploy to Vercel
1. Push to GitHub, import the repo in Vercel (framework: Next.js).
2. Add the four env vars from section 5 (set `NEXT_PUBLIC_SITE_URL` to your final domain).
3. Deploy. Publishing from `/admin` updates the live site immediately through `revalidateTag` — no redeploy needed.
4. **Custom domain**: Vercel → Settings → Domains → add your domain and set the DNS records it shows. Then update `NEXT_PUBLIC_SITE_URL` and redeploy once.

## 8. First-run smoke test (please do these)
- [ ] `npm run build` passes (fix any type errors surfaced by the real libraries).
- [ ] Log in at `/admin/login` with your admin account; log in with a non-admin account → rejected.
- [ ] Upload a profile photo, a certificate (image and PDF) and a resume PDF. Uploads use signed URLs with an XHR progress bar and fall back to the Supabase client; confirm one works end to end.
- [ ] Save a project as Draft → not visible on `/`, visible at `/admin/preview`; Publish → appears on `/` without redeploying.
- [ ] Publish a resume → `/resume` redirects to the PDF and the Download Resume buttons appear.
- [ ] Send a contact message → appears under Admin → Messages; 6th message from one network within an hour is refused.
- [ ] Check on a phone and with “reduce motion” enabled; check DevTools console for errors.

## 9. Architecture
```
app/                 public page (/), /resume redirect, /admin (login, panel, preview)
components/sections  the nine sections · components/3d scene · components/ui primitives · components/admin
lib/actions          server actions (all re-check admin server-side): content, upload, resume, profile, auth, contact
lib/auth             getAdminContext(): getUser() + is_admin() allowlist check
lib/database         cached public reads (tag "portfolio"), admin queries
lib/admin-config.ts  one config drives admin forms AND server-side Zod validation
supabase/            migrations, seed, tests
```
**Security model.** Three layers: middleware redirect (convenience only) → server-side `requireAdmin()` on every page and action → Postgres RLS (`is_admin()` requires a *confirmed* email on `admin_users`). Visitors can only read `status = 'published'` rows; drafts are never in public queries. The contact form calls a rate-limited `SECURITY DEFINER` function, so no privileged key exists.

**Storage model.** One public-read bucket with random UUID file names; the bucket cannot be listed. Published assets must be publicly fetchable, so a *draft* image is reachable by anyone who has its exact URL (unguessable, but not secret). Don't upload anything confidential.

## Content
`seed.sql` contains only what you supplied: your name, the four projects (CalmConnect as a hidden draft), the four hackathon entries (College Hackathon 3rd place, Build for Bengaluru Top 4, Ascent participant, College Expo 1st place), and the technologies you listed. The tagline and intro are **drafts for you to rewrite** in Admin → Profile. Education is a hidden placeholder. No dates, venues, links, certificates or social accounts were invented; sections with nothing published hide themselves.

## Design notes
3D hero: a faceted metallic core with three armillary rings that follows the pointer, drifts between content sides as you scroll and opens into a "portal" at Contact. Mobile/low-power devices get a simplified scene, reduced-motion users get a single still frame, and no-WebGL browsers get a gradient. Project cards use CSS 3D tilt rather than extra WebGL canvases, to protect performance.
