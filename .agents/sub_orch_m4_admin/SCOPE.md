# Scope: Milestone 4 (Admin & Audit Panel)

## Architecture
- Admin dashboard interface divides admin utilities into sections.
- `AdminToolsPanel.tsx`: Orchestrates the layout of the Admin tools and dashboard.
- `AuditoriaSection.tsx`: Displays client dossiers, handles filter/search selectors, and displays client list.
- `ExpedienteCard.tsx`: Individual dossier preview cards showing client progress, dossier details, and actions.
- Split Modal: Detailed split view panel. Left side is details/uploads, right side is progress checklist.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | Explore R3 requirements | Analyze the files (AdminToolsPanel, AuditoriaSection, ExpedienteCard, Split Modal) and establish specific design plans | None | PLANNED | |
| 2 | Implement R3 changes | Apply clean layout, premium card grid grouped by dossier type, and slate gray thin borders | M1 | PLANNED | |
| 3 | Review and Verify R3 | Review changes, run TS compiler, check production build, run tests | M2 | PLANNED | |

## Interface Contracts
- **Dossier Data Layout**: Clients grouped by dossier type (RootsType / expediente type).
- **Split Modal UI Elements**:
  - Selectors/buttons: Light slate gray borders (`border-slate-200` or v4 equivalent).
  - Responsive layout: Flex/Grid wrapping on smaller screens.
