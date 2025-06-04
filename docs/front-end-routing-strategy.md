## Routing Strategy (Proof-of-Concept)

  * **Primary Routing Mechanism:** Next.js App Router (folder structure in `app/` defines routes).
  * **Route Naming Conventions:** Follow folder names (typically `kebab-case` for URL segments if folders are named that way). Special files (`page.tsx`, `layout.tsx`) define UI.
  * **Route Parameters:** Next.js App Router dynamic segments (e.g., `app/draft/[leagueId]/page.tsx`).
  * **Authentication & Authorization Integration with Routing (Route Guards):**
      * Protected Routes: `app/(main)/` group requires authentication.
      * Public Routes: `app/(auth)/` group and root `app/page.tsx` are public.
      * Access Control (PoC): `app/(main)/layout.tsx` checks auth status; redirects unauthenticated users to `/login`. Next.js Middleware is an option for more advanced logic if needed.
  * **Programmatic Navigation:** `useRouter` hook or `<Link>` component from Next.js.