## Quick context

- Stack: Vite + React (TSX) + TypeScript + Tailwind CSS + shadcn-ui components.
- Package manager: pnpm (project uses `pnpm@8.x`). Node >= 18 is required (see `package.json`).
- Dev server: `pnpm run dev` (runs `vite`). Build: `pnpm run build`. Lint: `pnpm run lint`.

## Where to look first (high-value files)

- `package.json` — scripts, dependencies (dev/runtime). Use `pnpm` for install/run.
- `vite.config.ts` — defines `@` -> `./src` alias and includes a small plugin `@metagptx/vite-plugin-source-locator` (prefix `mgx`).
- `tsconfig.json` — TypeScript path mapping `@/*` -> `src/*`.
- `src/components/ui/` — all shared UI components (shadcn-ui variants). Import like `import { Button } from '@/components/ui/button'`.
- `src/pages/` — top-level route pages (add pages here and wire `App.tsx` routes).
- `src/services/supabaseClient.ts` — single place for Supabase client, typed interfaces and services (leadService, loanProductService, authService, subscriptions).
- `src/App.tsx` — global providers: `HelmetProvider`, `QueryClientProvider` (React Query), `TooltipProvider`, `Toaster`, and `BrowserRouter`.

## Project-specific conventions & patterns

- Path alias: use `@/` to import from `src/` (configured in both `tsconfig.json` and `vite.config.ts`).
- UI components are pre-packaged under `src/components/ui` and exported as small, focused components (follow existing filenames and export shapes when adding new ones).
- Routing: pages are components in `src/pages` and routed in `App.tsx`; add a `<Route path="/your-path" element={<YourPage />} />` when adding pages.
- Data access: use `src/services/supabaseClient.ts` for server interactions — it centralizes DB types and service functions. Prefer calling these service functions from hooks or React Query endpoints.
- Async state: project uses `@tanstack/react-query` (global `QueryClient` in `App.tsx`) — add queries/mutations using standard React Query patterns.
- Environment variables: Supabase credentials are read from `process.env.REACT_APP_SUPABASE_URL` and `process.env.REACT_APP_SUPABASE_ANON_KEY` in `src/services/supabaseClient.ts`. Provide these in your environment when running locally (e.g., using a `.env` or your shell). Note: this project uses `REACT_APP_` prefixed vars rather than `VITE_`.

## Build / Dev / Debug workflows

- Install: `pnpm i`
- Run dev server: `pnpm run dev` (Vite)
- Build for production: `pnpm run build`
- Preview production build locally: `pnpm run preview`
- Linting: `pnpm run lint` (runs `eslint --quiet ./src`). There are no test scripts currently.

## Integration & external dependencies to be aware of

- Supabase: `@supabase/supabase-js` — client and real-time subscriptions live in `src/services/supabaseClient.ts`.
- React Query: used across the app; QueryClient is instantiated once in `App.tsx`.
- Zustand: used for local state in places (scan `src/hooks`), and other libs: `framer-motion`, `recharts`, `react-router-dom`, `sonner` (toasts).

## Small guidance for code edits an AI should follow

- Keep imports using the `@/` alias. Example: `import { leadService } from '@/services/supabaseClient'`.
- When adding network calls, prefer placing them in `src/services/*` and returning plain data (let React Query handle caching). Example: `leadService.createLead(...)`.
- Match existing TypeScript interfaces when updating services (e.g., `LeadData`, `LoanProduct`, `UserProfile` in `supabaseClient.ts`).
- UI components: follow existing naming (PascalCase filenames) and export patterns in `src/components/ui`.
- Routing: add routes in `src/App.tsx` not in `main.tsx`.

## Known gaps / things to double-check manually

- Env var strategy: code expects `REACT_APP_*` variables; if you prefer using Vite `VITE_` vars, update `supabaseClient.ts` and document the change.
- There are no automated tests configured — if you add tests, also add npm scripts and CI wiring.

If any section is unclear or you'd like more examples (for example, a canonical component template or a sample React Query hook wired to `leadService`), tell me which part and I will iterate.
