# Explorer Findings Synthesis - Milestone 1 Theme & Style

## Consensus
- **Framework & Config**: The project uses **Tailwind CSS v4** with compilation managed inside `src/app/globals.css` using `@import "tailwindcss"` and `@theme`.
- **Slate Palette**: All standard shades from 50 to 950 need to be registered under `:root` and mapped in `@theme` as `--color-slate-*` to enable native utility classes.
- **Glassmorphism**: Static glassmorphism styling (`.glass-panel` and `.glass-card`) in `src/app/globals.css` must be refactored to use Tailwind CSS v4 `@utility` directive.
- **Scrollbar**: Scrollbars should be styled using theme properties and custom variables rather than hardcoded translucent colors.
- **Fonts**: The project should support `Inter` alongside `Geist`/`Geist_Mono`. This requires loading `Inter` from `next/font/google` in `src/app/layout.tsx` and updating `--font-sans` in `src/app/globals.css` to prefer `Inter` with fallbacks.

## Resolved Gaps & Custom Tokens
The explorers scanned existing components (`LoginForm.tsx`, `Sidebar.tsx`, `DocsPanel.tsx`) and found several custom unregistered tokens referenced in styles:
- `slate-350` (used as `hover:border-slate-350`)
- `slate-550` (used as `text-slate-550`)
- `slate-850` (used as `group-hover:text-slate-850` / active hover text)
- `amber-605` (used as `text-amber-605`)

These custom shades MUST be defined alongside the standard slate palette in `globals.css` to ensure visual consistency and prevent broken styles.

---

## Action Plan for Worker

### 1. Update `src/app/layout.tsx`
Load `Inter` from `next/font/google`, define `variable: "--font-inter"`, and inject it into the html tag:
```typescript
import { Inter, Geist, Geist_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// ... inside RootLayout ...
<html lang="en" className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
```

### 2. Update `src/app/globals.css`
- Add CSS variables in `:root` for standard slate colors (50 to 950) plus custom shades (`slate-55`, `slate-105`, `slate-350`, `slate-450`, `slate-550`, `slate-555`, `slate-850`).
- Add glassmorphism variable parameters in `:root` for flexibility.
- Map color variables under `@theme` using `--color-slate-*` prefix.
- Add `--color-amber-605: #d97706;` inside `@theme`.
- Define fonts inside `@theme` with `Inter` as primary:
  `--font-sans: var(--font-inter), var(--font-geist-sans), sans-serif;`
- Refactor `.glass-panel` and `.glass-card` as `@utility` directives.
- Implement `.bg-grid-pattern` and `.bg-dot-pattern` as `@utility` directives.
- Style `::-webkit-scrollbar` variables properly.

### 3. Verification
- Run static type checks: `npx tsc --noEmit`
- Run build compilation: `npm run build`
