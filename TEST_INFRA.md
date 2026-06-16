# Impulsar Page — E2E Testing Infrastructure Document

This document outlines the End-to-End (E2E) testing plan and design for the **Impulsar Platform**, targeting four critical features: **Authentication**, **Client Dashboard**, **Admin Client Audit**, and **Admin Split Modal**. 

The test cases are divided into **four tiers** matching the project's testing hierarchy:
*   **Tier 1: Smoke / Critical Path Tests** — Checks if pages load and major components render.
*   **Tier 2: Core Functionality / Feature Validation** — Tests standard complete workflows.
*   **Tier 3: Boundary / Edge Cases** — Validation triggers, empty inputs, unexpected states.
*   **Tier 4: Adversarial / Security & Negative Tests** — Authentication bypassing, injection checks, path traversal, role guards.

---

## 1. Testing Environment & Running Guide

### 1.1 Local Browser Resolution
Because default CI/CD runners may lack downloaded Chromium binaries, the E2E tests are configured to resolve and run against local web browsers installed on the host system. The runner script programmatically checks for Chrome or Edge in standard paths (like Windows Program Files):

*   `C:\Program Files\Google\Chrome\Application\chrome.exe`
*   `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
*   `C:\Program Files\Microsoft\Edge\Application\msedge.exe`
*   `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`

### 1.2 Programmatic Next.js Server & Database Lifecycle
To run the E2E test suite locally or on a dev machine:
1.  **Clean and Seed Database:** Ensure the PostgreSQL database is fresh.
    ```bash
    npx prisma migrate reset --force
    npx prisma db seed
    ```
    This seeds the default users:
    *   **Admin Carlos:** `admin.carlos@impulsar.com` / `admin_secure_password`
    *   **Admin Yodier:** `yodiermurillo@gmail.com` / `yoi1234`
    *   **Client Alejandro:** `alejandro.gomez@gmail.com` / `user_secure_password` (Process: *Regularización de Cuenta Personal*)
    *   **Client María:** `m.torres@outlook.com` / `user_secure_password_2` (Process: *Regularización Comercial Express*)
2.  **Compile and Run App:** Build the Next.js production build and start the server on port 3000.
    ```bash
    npm run build
    npm run start
    ```
3.  **Run Tests:** Execute the test runner.
    ```bash
    node run_e2e.js
    ```

---

## 2. Test Cases Matrix (52 Cases)

### Feature 1: Authentication (TC-AUTH-01 to TC-AUTH-13)

| Test ID | Tier | Title / Scope | Description | Prerequisites & Test Data | Test Steps | Expected Result | Selector Strategy / Puppeteer Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Tier 1 | Admin Carlos Smoke Login | Verify Carlos can log in successfully. | Admin user credentials seeded. | 1. Go to `/`<br>2. Enter email: `admin.carlos@impulsar.com`<br>3. Enter password: `admin_secure_password`<br>4. Click Submit | Redirection to `/dashboard`. Welcome banner shows "Hola, Carlos 👋". | `input[type="email"]`, `input[type="password"]`, `button[type="submit"]`. Evaluated text: "Carlos". |
| **TC-AUTH-02** | Tier 1 | Admin Yodier Smoke Login | Verify Yodier can log in successfully. | Admin user credentials seeded. | 1. Go to `/`<br>2. Enter email: `yodiermurillo@gmail.com`<br>3. Enter password: `yoi1234`<br>4. Click Submit | Redirection to `/dashboard`. Welcome banner shows "Hola, Yodier 👋". | `input[type="email"]`, `input[type="password"]`, `button[type="submit"]`. Evaluated text: "Yodier". |
| **TC-AUTH-03** | Tier 1 | Client Alejandro Smoke Login | Verify client can log in successfully. | Client user credentials seeded. | 1. Go to `/`<br>2. Enter email: `alejandro.gomez@gmail.com`<br>3. Enter password: `user_secure_password`<br>4. Click Submit | Redirection to `/dashboard`. Client view contains "Estado de tu Expediente". | `input[type="email"]`, `input[type="password"]`, `button[type="submit"]`. Evaluated text: "Estado de tu Expediente". |
| **TC-AUTH-04** | Tier 1 | Sidebar Logout Flow | Verify user can log out of the platform. | Logged in user session exists. | 1. Click logout button in Sidebar (label "Cerrar Sesión"). | Redirection back to `/` login screen. Session cookies are deleted. | `aside button` containing text "Cerrar Sesión". Verify URL is `http://localhost:3000/`. |
| **TC-AUTH-05** | Tier 2 | Success Banner Animation | Verify green success banner renders. | Valid credentials entered. | 1. Submit login form with valid credentials. | Green success banner "¡Sesión iniciada con éxito!..." appears with fade-in animation. | `div.bg-emerald-50` element containing success text. |
| **TC-AUTH-06** | Tier 2 | Google OAuth Redirect | Verify the third-party Google auth button works. | Login page loaded. | 1. Click "Google" button. | Redirection is initiated targeting Google accounts page. | `button` containing svg + text "Google". Verify redirection to external URL. |
| **TC-AUTH-07** | Tier 2 | Remember Session State | Check persistence of login session. | Valid logged in session. | 1. Log in.<br>2. Simulate browser restart (close/open page).<br>3. Navigate to `/dashboard`. | User bypasses login and goes directly to dashboard. | Verify no redirection to `/` occurred. |
| **TC-AUTH-08** | Tier 3 | Empty Inputs Validation | Verify HTML5 form requirements. | Login page loaded. | 1. Leave email empty.<br>2. Click submit. | Browser displays validation alert; form submission is prevented. | Input `input[type="email"]:invalid` check using `page.$eval`. |
| **TC-AUTH-09** | Tier 3 | Invalid Email Format | Verify email structural check. | Login page loaded. | 1. Enter invalid email format (e.g. `carlos@invalid`).<br>2. Click submit. | Form submission blocked or handles formatting error. | Input `input[type="email"]:invalid` checked. |
| **TC-AUTH-10** | Tier 3 | Incorrect Credentials Alert | Check red banner feedback for wrong passwords. | Seeded credentials. | 1. Enter email `admin.carlos@impulsar.com`<br>2. Enter password `wrong_pwd`<br>3. Click Submit | Form returns error banner "Credenciales incorrectas. Inténtalo de nuevo." | `div.bg-rose-50` containing matching text. |
| **TC-AUTH-11** | Tier 3 | Non-existent User Alert | Check non-seeded email feedback. | Email not in db. | 1. Enter `no_exists@gmail.com`<br>2. Enter random password.<br>3. Submit. | Form returns credentials incorrect banner. | `div.bg-rose-50` selector. |
| **TC-AUTH-12** | Tier 4 | Unauthenticated Direct Access | Verify security guard block on dashboard. | Fresh browser context, no cookie. | 1. Direct navigate to `/dashboard` or `/dashboard/docs`. | Instantly redirected to `/` landing page. | Verify current URL is `http://localhost:3000/`. |
| **TC-AUTH-13** | Tier 4 | Login Rate Resilience | Check error response when flood submitting. | Login form loaded. | 1. Rapidly submit form multiple times. | System stays responsive, returns standard validation errors, doesn't crash server. | Loop form submissions in page context. |

---

### Feature 2: Client Dashboard (TC-DASH-01 to TC-DASH-13)

| Test ID | Tier | Title / Scope | Description | Prerequisites & Test Data | Test Steps | Expected Result | Selector Strategy / Puppeteer Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-DASH-01** | Tier 1 | View Welcome Banner | Check dashboard layout title. | Logged in as Alejandro. | 1. Navigate to `/dashboard`. | Header "Hola, Alejandro 👋" is visible. | `h2` containing "Hola, Alejandro". |
| **TC-DASH-02** | Tier 1 | View Dossier Progress Card | Verify status card displays. | Logged in as Alejandro. | 1. Inspect dashboard card. | Card with text "Estado de tu Expediente" and progress details displays. | `h3` containing "Estado de tu Expediente". |
| **TC-DASH-03** | Tier 1 | Sidebar Hover Expansion | Verify sidebar toggles labels. | Logged in as Alejandro. | 1. Move cursor / hover over the `<aside>` element. | Aside element expands, sidebar width increases, labels reveal. | `aside` element selector. Evaluate layout width changes. |
| **TC-DASH-04** | Tier 1 | Admin Actions Hidden | Verify client cannot view administrative links. | Logged in as Alejandro. | 1. Inspect sidebar items and main content cards. | No "Herramientas Admin" or "Docs" button/card is present. | `button` search by text content. |
| **TC-DASH-05** | Tier 2 | Steps Checklist Display | Verify list of assigned steps. | Logged in as Alejandro (4 steps). | 1. Inspect steps container. | 4 steps display, matching the Personal process steps. | List items or cards representing DNI, Nómina, Contrato, and WhatsApp ID. |
| **TC-DASH-06** | Tier 2 | Mandatory Badge Validation | Verify isMandatory visual indicator. | Logged in as Alejandro. | 1. Inspect step cards list. | DNI, Nómina, Contrato show "Obligatorio" label; WhatsApp does not. | `span` containing text "Obligatorio" within the step block. |
| **TC-DASH-07** | Tier 2 | Upload File to Pending Step | Verify client can upload a PDF. | Logged in as Alejandro. Step "Contrato" is pending. | 1. Click upload input on "Contrato de Adhesión Firmado".<br>2. Choose test pdf.<br>3. Upload. | Status updates to "Uploaded" (Subido) and showing link. | `input[type="file"]` corresponding to that step. Verify status badge update. |
| **TC-DASH-08** | Tier 2 | Upload Text Value Input | Verify inputting a text-based value for step. | Logged in as Alejandro. | 1. Enter whatsapp ID into WhatsApp step text input.<br>2. Submit. | Progress updates, step details save successfully. | Input text box inside step card. |
| **TC-DASH-09** | Tier 3 | View Rejection Admin Comments | Verify validation comments render on client dashboard. | Alejandro logged in. Nómina step has admin comments. | 1. Find step "Justificante de Ingresos". | Rejection comment is rendered below step: "La nómina aportada corresponde al año anterior..." | `p` or `div` containing text "La nómina aportada...". |
| **TC-DASH-10** | Tier 3 | Empty Dossier View | Verify look when client has no assigned rootsType. | Client with rootsTypeId = null. | 1. Log in as client.<br>2. Inspect dashboard page. | Shows a message "Sin expediente asignado" or "Este cliente no tiene ningún expediente o paso asignado." | Check body text content for warning strings. |
| **TC-DASH-11** | Tier 4 | Bypass Role Route Guard | Attempt to access admin features directly. | Logged in as client Alejandro. | 1. Navigate to URL `http://localhost:3000/dashboard/admin-tools` or simulate action execution. | Blocked, redirected to `/dashboard` home or displays error. | Check current URL remains `/dashboard` or gets blocked. |
| **TC-DASH-12** | Tier 4 | Document Access Security | Verify direct URL access protection. | Client session active. | 1. Attempt to request URL of another client's file. | Access is denied (HTTP 403 or server blocks access). | Trigger HTTP request to another user's file path via Puppeteer. |
| **TC-DASH-13** | Tier 4 | Invalid Upload Payload | Check validation when uploading malware/wrong extension files. | Logged in as Alejandro. | 1. Attempt to upload non-supported extension file (e.g. `.exe` or `.zip`). | Upload is rejected, error alert displays. | File input target. Verify error modal/alert. |

---

### Feature 3: Admin Client Audit (TC-AUD-01 to TC-AUD-13)

| Test ID | Tier | Title / Scope | Description | Prerequisites & Test Data | Test Steps | Expected Result | Selector Strategy / Puppeteer Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUD-01** | Tier 1 | View Admin Panel View | Verify page title and sidebar. | Admin carlos logged in. | 1. Click "Herramientas Admin" tab. | Main page renders text "Herramientas Administrativas". | `h2` containing text "Herramientas Administrativas". |
| **TC-AUD-02** | Tier 1 | Total Client Count Badge | Verify the badge counting clients. | Admin Carlos logged in. | 1. Look at "Auditoría de Clientes" card header. | Displays correct number of clients (e.g. "4 Clientes"). | `span` containing "Clientes". |
| **TC-AUD-03** | Tier 1 | KPI Stats Calculations | Check calculated KPI numbers. | Seeded data. | 1. Inspect cards in top KPI bar. | Total clients count, Active dossiers, and statuses match Database state. | KPI container selector `div` containing figures. |
| **TC-AUD-04** | Tier 2 | Client Search Name Filter | Verify searching by client name. | Seeded users. | 1. Enter "Alejandro" in search field. | Only Alejandro Gómez card is listed. María Torres is hidden. | `input[placeholder="Buscar por cliente o correo..."]`. Check matching cards in lists. |
| **TC-AUD-05** | Tier 2 | Client Search Email Filter | Verify searching by client email. | Seeded users. | 1. Enter "m.torres" in search field. | Only María Torres card is listed. | Search field. Check card list names. |
| **TC-AUD-06** | Tier 2 | Filter list by Dossier Type | Select a dossier to filter clients. | Seeded data. | 1. Select "Regularización Comercial Express" in filter dropdown. | Only María Torres is displayed. | `select` wrapper. Verify that only express process clients remain. |
| **TC-AUD-07** | Tier 2 | Filter list by "Sin Asignar" | Filter clients with no assigned processes. | Seeded data. | 1. Select "Sin Asignar" in filter dropdown. | Only clients with no process assigned display. | `select` dropdown, check matching cards in layout. |
| **TC-AUD-08** | Tier 2 | Assign Dossier in Card | Assign a process inside client card. | Admin Carlos logged in. Client has "Sin Asignar". | 1. Select "Regularización Comercial Express" in the dropdown inside client's card. | Server updates user's rootsTypeId. Client card moves to express group. | Card level `select` dropdown. Click dropdown, select option, verify card re-group. |
| **TC-AUD-09** | Tier 3 | Clear Search Query Reset | Verify list resets when search is cleared. | Input filled. | 1. Clear search input field. | All clients matching selected category display again. | Empty input field value. Verify list count. |
| **TC-AUD-10** | Tier 3 | Zero Results Search View | Check page when search doesn't find matches. | Admin dashboard loaded. | 1. Enter "non_existent_username_123" in search. | Card grid is empty. Text "No se encontraron clientes..." is visible. | Selector text content match. |
| **TC-AUD-11** | Tier 3 | Conflicting Filters | Search for string and choose non-matching category. | Seeded users. | 1. Enter "Alejandro" in search.<br>2. Select "Regularización Comercial Express" in filter select. | Grid is empty (Alejandro is in Personal process). | Combined filters. Check empty state. |
| **TC-AUD-12** | Tier 4 | SQL Injection Resilience | Enter SQL injection payloads in search query. | Admin panel loaded. | 1. Input `' OR '1'='1` in search field. | Input is handled as a literal string. Database query handles it safely (no records leaked). | Search input. Verify no crash or unauthorized records displayed. |
| **TC-AUD-13** | Tier 4 | XSS Vulnerability Check | Enter script tags in search. | Admin panel loaded. | 1. Input `<script>alert('hack')</script>` in search. | Input is sanitized. No alert or script executions. | Search input. Check if code evaluates or escapes. |

---

### Feature 4: Admin Split Modal (TC-MOD-01 to TC-MOD-13)

| Test ID | Tier | Title / Scope | Description | Prerequisites & Test Data | Test Steps | Expected Result | Selector Strategy / Puppeteer Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-MOD-01** | Tier 1 | Open Client Split Modal | Check dialog opens on card click. | Admin Carlos logged in. | 1. Click on Alejandro Gómez's card. | Split modal opens. Title "Ficha Detallada del Cliente" is visible. | `div.cursor-pointer.group` click. Modal title header: `h3.text-base.font-bold`. |
| **TC-MOD-02** | Tier 1 | View Client Details Left Column | Check details display on the left. | Admin Carlos logged in. | 1. Inspect left column in modal. | Displays Name, Lastname, Email, NIE, whatsappId, appointment date, etc. | Check texts next to labels "NIE", "Teléfono / WA", "Fecha Cita". |
| **TC-MOD-03** | Tier 1 | Close Split Modal | Check modal closes. | Modal open. | 1. Click "Cerrar Ficha" button. | Modal closes. Dashboard controls become interactive. | `button` with text "Cerrar Ficha" or close button in header. |
| **TC-MOD-04** | Tier 2 | Toggle Edit Mode | Check form fields replace text. | Modal open. | 1. Click "Editar" button on client card. | Static details are replaced with text inputs, select dropdowns. | `button` containing text "Editar". Verify input elements appear. |
| **TC-MOD-05** | Tier 2 | Save Edited Client Details | Verify updating user metadata saves. | Modal open in Edit Mode. | 1. Change Lastname to "Gómez Modificado".<br>2. Click "Guardar". | Detail values update, save successfully, and static view reflects change. | Input value edits, click `button` with text "Guardar". |
| **TC-MOD-06** | Tier 2 | Open Google Drive Link | Verify configured folder opens. | Client has Drive URL. | 1. Click "Ver Carpeta" link. | Opens the Drive URL in a new browser tab. | `a` containing text "Ver Carpeta". |
| **TC-MOD-07** | Tier 2 | Upload Passport File | Upload a file from the modal. | Modal open. | 1. Choose file in "Subir Pasaporte" field. | File writes to server directory, link changes to "Ver Archivo" and status "Uploaded". | `input[type="file"]` under passport label. |
| **TC-MOD-08** | Tier 2 | Approve Step Status | Verify validation status select dropdown. | Modal open. Steps visible. | 1. Find step "Contrato de Adhesión".<br>2. Select "Approved" in dropdown. | Progress bar updates, status badge reflects "Aprobado". | Step level `select` element. Validate background/text color. |
| **TC-MOD-09** | Tier 2 | Reject Step Status | Verify setting step to rejected. | Modal open. Steps visible. | 1. Select "Rejected" in step status dropdown. | Status badge changes to "Rechazado". | Step level `select`. |
| **TC-MOD-10** | Tier 2 | Admin Uploads Step Document | Upload a document on behalf of client. | Modal open. Steps visible. | 1. Choose file under step's file input "Cargar:". | File uploaded, associated with user step, link "document.pdf" displays. | Input file element co-located in step card. |
| **TC-MOD-11** | Tier 3 | Clear Appointment Date | Verify clearing date inputs in edit. | Modal in Edit Mode. | 1. Clear "Fecha de Cita" input.<br>2. Click "Guardar". | Saved successfully with appointmentDate = null; status shows "Sin cita". | Date input value reset. Save and verify. |
| **TC-MOD-12** | Tier 3 | Blank Mandatory Fields Block | Verify input validation on client edit. | Modal in Edit Mode. | 1. Clear Name text input.<br>2. Click Save. | Form block triggers; save fails or input alerts user. | Name input text empty. Check validation state. |
| **TC-MOD-13** | Tier 4 | Status Value Tampering | Check API response when injecting invalid status. | Modal open. Steps visible. | 1. Attempt to inject an unconfigured status option (e.g. `HACKED`) to update action. | Database or action blocks the save, keeping valid status values. | Execute modified select change option. Verify database is unaltered. |

---

## 3. Puppeteer Integration & Execution Code

Below is a proposed implementation for running these E2E tests programmatically. Place this runner in the root folder as `run_tests.js`. It detects Windows local browsers, prepares database/server, launches headless Chrome, and performs assertions.

```javascript
// run_tests.js
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// 1. Resolve local browser executable
const browserPaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = '';
for (const p of browserPaths) {
  if (fs.existsSync(p)) {
    executablePath = p;
    break;
  }
}

if (!executablePath) {
  console.error("❌ E2E ERROR: No compatible Chrome/Edge browser found!");
  process.exit(1);
}

console.log(`🚀 Using browser: ${executablePath}`);

// 2. Database seed reset
console.log("🔄 Resetting database with seed data...");
execSync('npx prisma db seed', { stdio: 'inherit' });

// 3. Test Runner Execution
(async () => {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Capture errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  const targetUrl = 'http://localhost:3000';

  console.log(`🌐 Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });

  // Example TC-AUTH-01: Admin Carlos Login
  console.log('Testing TC-AUTH-01: Login as Admin Carlos...');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin.carlos@impulsar.com');
  await page.type('input[type="password"]', 'admin_secure_password');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  const dashboardUrl = page.url();
  if (dashboardUrl.includes('/dashboard')) {
    console.log('✅ TC-AUTH-01 SUCCESS: Redirected to dashboard.');
  } else {
    throw new Error('❌ TC-AUTH-01 FAILED: Did not redirect to dashboard.');
  }

  // Verify welcome title
  const welcomeText = await page.evaluate(() => document.body.textContent);
  if (welcomeText.includes('Hola, Carlos')) {
    console.log('✅ TC-AUTH-01 SUCCESS: Welcome text confirmed.');
  } else {
    throw new Error('❌ TC-AUTH-01 FAILED: Welcome text Carlos not found.');
  }

  // Example TC-AUD-01 & TC-AUD-04: Client Audit Screen & Search
  console.log('Testing TC-AUD-01: Access Admin Tools...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Herramientas Admin'));
    if (btn) btn.click();
  });
  
  await page.waitForFunction(() => document.body.textContent.includes('Herramientas Administrativas'), { timeout: 5000 });
  console.log('✅ TC-AUD-01 SUCCESS: Loaded Admin panel.');

  console.log('Testing TC-AUD-04: Search client by name...');
  await page.waitForSelector('input[placeholder="Buscar por cliente o correo..."]');
  await page.type('input[placeholder="Buscar por cliente o correo..."]', 'Alejandro');
  await new Promise(r => setTimeout(r, 500)); // wait for filtering state

  const matches = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('h4'));
    return list.map(el => el.textContent.trim());
  });

  if (matches.some(name => name.includes('Alejandro Gómez')) && !matches.some(name => name.includes('María Torres'))) {
    console.log('✅ TC-AUD-04 SUCCESS: Filter applied correctly.');
  } else {
    throw new Error('❌ TC-AUD-04 FAILED: Search results incorrect.');
  }

  // Example TC-MOD-01: Open Split Modal
  console.log('Testing TC-MOD-01: Open Client Split Modal...');
  // Click on Alejandro card
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div.cursor-pointer.group'));
    const alejandroCard = cards.find(c => c.textContent.includes('Alejandro Gómez'));
    if (alejandroCard) alejandroCard.click();
  });

  await page.waitForFunction(() => document.body.textContent.includes('Ficha Detallada del Cliente'), { timeout: 5000 });
  console.log('✅ TC-MOD-01 SUCCESS: Split modal displayed.');

  // Clean up
  console.log('Closing browser...');
  await browser.close();
  console.log('🎉 E2E Basic check complete!');
})().catch(err => {
  console.error('❌ E2E Execution Failed:', err);
  process.exit(1);
});
```
