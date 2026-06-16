# E2E Test Plan Design — Handoff Report

## 1. Observation
The following file structures, parameters, and selectors were directly observed:
*   **Compile & Execution Harness**:
    *   `package.json` lists the platform dependencies: `"next": "16.2.6"` (line 17), `"next-auth": "^5.0.0-beta.25"` (line 18), `"prisma": "^7.8.0"` (line 34), and `"puppeteer-core": "^25.1.0"` (line 35).
    *   `package.json` contains scripts: `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`.
    *   `qa_check.js` (lines 5-10) defines a routine checking local browser installation paths:
        ```javascript
        const paths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
        ];
        ```
*   **Database Schema & Seed Records**:
    *   `prisma/schema.prisma` configures a PostgreSQL datasource (line 7), defining models `User` (line 25), `RootsType` (line 17), `Step` (line 85), `UserProcessProgress` (line 113), and `StatusConfig` (line 130).
    *   `prisma/seed.ts` (lines 57-109) seeds these test users:
        *   Carlos (Admin): `admin.carlos@impulsar.com` / `admin_secure_password`
        *   Yodier (Admin): `yodiermurillo@gmail.com` / `yoi1234`
        *   Alejandro (Client): `alejandro.gomez@gmail.com` / `user_secure_password`
        *   María (Client): `m.torres@outlook.com` / `user_secure_password_2`
*   **Authentication Elements**:
    *   `src/components/landing/LoginForm/LoginForm.tsx` lists:
        *   Email input: `type="email"` (line 75)
        *   Password input: `type="password"` (line 89)
        *   Submit button: `Button type="submit"` (line 98)
        *   Google login: `Button variant="secondary" onClick={handleGoogleLogin}` (lines 111-135)
        *   Banners: `div` containing `{error}` (line 60, green/red styles matching `.bg-rose-50`/`.bg-emerald-50`)
*   **Client Dashboard Structure**:
    *   `src/app/dashboard/page.tsx` renders `DashboardClientContainer` (line 45) with `clientView` (line 17) displaying card `"Estado de tu Expediente"` (line 36).
    *   `src/components/dashboard/Sidebar/Sidebar.tsx` renders navigation items: `"Inicio"` (line 23), `"Herramientas Admin"` (line 34), `"Docs"` (line 43), and `"Cerrar Sesión"` (line 141). Aside hover expands sidebar (line 58).
*   **Admin Client Audit**:
    *   `src/components/dashboard/AdminToolsPanel/AuditoriaSection.tsx` includes:
        *   Search Box: `input[placeholder="Buscar por cliente o correo..."]` (line 83-89).
        *   Dossier Filter: `select` with options `all`, `unassigned`, and specific RootsType IDs (line 91-105).
        *   Client Card elements: clickable grid item (line 130) containing name `h4` (line 149), email `p` (line 152), and mock NIE generator label (line 156).
        *   Dossier Assignment dropdown: `select` with options (`rootsTypeId || "null"`) (line 167-180).
*   **Admin Split Modal (Client Ficha Modal)**:
    *   `src/components/dashboard/AdminToolsPanel/AdminToolsPanel.tsx` contains `MODAL 4: DETALLE DE CLIENTE (SPLIT VIEW)` (lines 647-1008):
        *   Left side static card shows fields for WhatsApp, Drive URL link, Date, and Passport status.
        *   Left side form edit toggle: `button` with text `"Editar"` (line 780). Renders input text fields and dropdown for passport status (`Pending`, `Uploaded`, `Approved`, `Rejected`).
        *   Right side step rows: loops over `selectedClient.steps` (line 919) rendering step name, optional mandatory badge (line 928), file upload input (line 984), and status drop-down (line 955) populated with dynamic statuses.

---

## 2. Logic Chain
1.  **Browser Availability**: Based on `qa_check.js` (lines 5-10) and `check_browser.js`, host systems running tests may lack dedicated NPM browser binaries. Therefore, using system browser discovery (`Google Chrome` or `Microsoft Edge` paths) combined with `puppeteer-core` ensures test execution compatibility without massive setup overhead.
2.  **Authentication Feasibility**: The `LoginForm` inputs (`type="email"`, `type="password"`) and submit action provide explicit selector bindings. Success/error notifications are associated with specific classes (`bg-rose-50` / `bg-emerald-50`) which allow the E2E framework to instantly assert password validity, empty values validation, or failed logins.
3.  **Client Dashboard View Limits**: `DashboardClientContainer` conditions options such as "Herramientas Admin" and "Docs" tabs on user roles (`isAdmin = user.role === "admin"`). Asserting the lack of these selectors on a client's sidebar guarantees front-end role guard enforcement.
4.  **Auditoria Filter Actions**: `AuditoriaSection` filters the list of displayed user card elements via text search matches or select element options. Asserting the length of `div.cursor-pointer.group` cards after typing or selecting filters isolates search, filter, and assignment behavior.
5.  **Split Modal Detail Flow**: The admin details modal toggles between view mode and edit mode. Form state is bound to standard inputs (`type="text"`, `type="date"`, `type="month"`). Asserting state persistence after clicking "Guardar" confirms the database mutations execute cleanly.

---

## 3. Caveats
*   The tests are designed under the assumption that the local PostgreSQL instance has been seeded with standard developer profiles defined in `prisma/seed.ts`. Altering the seed script without updating the test usernames will cause verification failures.
*   File upload tests assume that sample PDFs or image files exist in local directories relative to the test runner.
*   Direct browser testing was not run because the agent is operating in a read-only investigation scope (no execution permission for local browser pipelines).

---

## 4. Conclusion
*   The platform structure is fully compatible with E2E Puppeteer automation. Target selectors are highly visible due to clean Tailwind classes and standard element inputs.
*   `TEST_INFRA.md` has been created in the workspace root path detailing **52 E2E test cases** covering Tiers 1-4 across the 4 key features.
*   It is recommended to place the final E2E execution files under an `e2e/` folder in the project root, using `run_tests.js` as the central script to orchestrate the database setup, browser resolution, test sequence execution, and browser teardown.

---

## 5. Verification Method
1.  **Inspect TEST_INFRA.md**:
    *   Open `d:\DEV\AuthSndr\ImpulsarPage\TEST_INFRA.md` using `view_file` to confirm that all 52 test cases are documented with precise Tiers, Descriptions, Steps, Expected Results, and Selector Strategies.
2.  **Verify browser executable path**:
    *   Run `node check_browser.js` on the target machine to verify that at least one of the Chrome or Edge installation directories resolves as `FOUND`.
