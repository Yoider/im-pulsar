# Project: Impulsar Page Redesign

## Architecture
The Impulsar platform is a Next.js (App Router) web application utilizing Tailwind CSS v4 and Prisma with PostgreSQL (pg). It contains three main views/flows:
1. **Login Flow**: Minimalist login form that authenticates users and redirects them to their dashboard based on their role (`client` or `admin`).
2. **Client Dashboard**: A private view where clients can inspect their profile, uploaded passport status, scheduled appointment date, and a checklist of steps required for their dossier with individual progress/upload buttons.
3. **Admin Tools & Audit Panel**: An administrative dashboard divided into two columns:
   - **Left Column**: List of clients grouped by dossier type (RootsType) using a premium card grid. Selecting a client opens the **Split Modal**.
   - **Split Modal**: A split panel where the left side displays client details (drive folders, passport details, contact details, file uploads) and the right side displays the checklist of steps for the selected client, allowing admins to approve/reject steps and view/upload files.
   - **Right Column**: Configurations for dossier types (RootsType) and system statuses (StatusConfig).

## Code Layout
- `src/app/globals.css` - Stylesheet containing theme colors, tailwind v4 directives, and custom utility classes.
- `src/app/page.tsx` - Login page containing the LoginForm.
- `src/components/landing/LoginForm/LoginForm.tsx` - Login form component.
- `src/app/dashboard/page.tsx` - Dashboard router page.
- `src/components/dashboard/DashboardClientContainer/DashboardClientContainer.tsx` - Client Dashboard container and view.
- `src/components/dashboard/AdminToolsPanel/AdminToolsPanel.tsx` - Main admin dashboard layout.
- `src/components/dashboard/AdminToolsPanel/AuditoriaSection.tsx` - Admin client listing & audit section.
- `src/components/dashboard/AdminToolsPanel/ExpedienteCard.tsx` - Component displaying a client dossier preview card in the admin panel.
- `src/components/dashboard/AdminToolsPanel/ExpedientesSection.tsx` - Dossier types list and management.
- `src/components/dashboard/AdminToolsPanel/EstadosSection.tsx` - System status colors and configurations.
- `src/components/ui/Modal/Modal.tsx` - Shared modal components including the Split Modal.
- `src/backend/actions.ts` - Server Actions for DB queries, file uploads, step status updates.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | Theme & Style (R1) | Set up slate palette, Google fonts, clean hierarchies in `globals.css` and verify. | None | DONE | 06b76eaa-d3ac-47c0-b213-0a38a48db380 |
| 2 | Login Redesign (R4) | Redesign LoginForm and parent pages to match the minimalist slate theme. | 1 | IN_PROGRESS | b9744872-d6cb-4747-b835-f3f57a554748 |
| 3 | Client Dashboard (R2) | Redesign `DashboardClientContainer` to use cards, dynamic SVG progress, background curves. | 1 | IN_PROGRESS | a3d633d6-5db4-439b-89dc-1c76d86cc867 |
| 4 | Admin & Audit Panel (R3) | Redesign `AdminToolsPanel`, cards, selectors, Split Modal. Group by dossier type. | 1 | IN_PROGRESS | 4fffdae2-2a62-4bab-91de-cc5588868ea4 |
| 5 | E2E Testing Suite (Dual) | Design and construct a comprehensive test suite covering Tiers 1-4. | None | IN_PROGRESS | 83a97142-c6dd-4e0e-94c3-c6cf7a59a546 |
| 6 | E2E & Adversarial Verification | Pass 100% of E2E tests, then run adversarial coverage hardening. | 2, 3, 4, 5 | PLANNED | |

## Interface Contracts
- **User Progression**:
  - `passportStatus`: 'Pending' | 'Uploaded' | 'Approved' | 'Rejected'
  - Step Progress States: managed in `UserProcessProgress` (mapped via `StatusConfig`).
- **Server Actions**:
  - `getUsersAction()`: returns client lists with dossier requirements.
  - `updateUserStepStatusAction(userId, stepId, status)`: updates step state.
  - `uploadClientFileAction(formData)`: handles file uploads.
