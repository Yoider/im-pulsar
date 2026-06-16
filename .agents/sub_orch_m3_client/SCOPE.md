# Scope: Milestone 3 (Client Dashboard)

## Architecture
- `src/app/dashboard/page.tsx`: Entry point for client dashboard. Fetches user session, fetches dossier data, and imports `DashboardClientContainer`.
- `src/components/dashboard/DashboardClientContainer/DashboardClientContainer.tsx`: Render component for client view. Includes:
  - Welcome banner with client info.
  - Overall progress card showing percentage of approved steps via circular/semicircular SVG progress chart.
  - Step list displaying dossier progress steps loaded from DB with upload interface for pending steps.
  - Premium look/feel (rounded-2xl, background decorative curves, Tailwind styling).
- Database interface: Prisma client queries to get `Dossier` and associated `DossierStep` (or similar schema files). We need to examine these models first.

## Interface Contracts
- Page to Container props: Passing down dossier info, steps, and user session details.
- Client actions: Dynamic file uploading (sending files to storage or API endpoint and updating DB state).

## Verification Plan
1. **Typescript compilation**: `npm run build` or `npx tsc --noEmit`.
2. **Next.js production build**: `npm run build`.
3. **Dynamic verification**: Verifying UI components render dossier data and handle dynamic uploads.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration | Read relevant files (Dashboard page, container, Prisma schema, API routes) | None | IN_PROGRESS |
| 2 | Implementation | Rebuild dashboard client page/container with DB fetching, premium cards, SVG charts, and upload function | Exploration | PLANNED |
| 3 | Review | Verify correctness, Tailwind classes, SVG dynamic calculations | Implementation | PLANNED |
| 4 | Audit & Verify | Integrity forensics check + next build | Review | PLANNED |
