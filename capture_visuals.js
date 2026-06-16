const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { getExecutablePath, resetDb } = require('./e2e/helpers');

const brainDir = 'C:/Users/yodie/.gemini/antigravity/brain/dacb47b7-a9b8-46ef-972e-81b866e48f82';

async function run() {
  console.log("🚀 Starting Redesign Visual Audit capturing...");
  const executablePath = getExecutablePath();
  console.log(`Using browser path: ${executablePath}`);

  console.log("🔄 Resetting database...");
  resetDb();

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Page level error trapping
  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

  // 1. Capture Login Screen
  console.log("📸 Capturing login page...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await new Promise(r => setTimeout(r, 1000)); // wait for transitions
  await page.screenshot({ path: path.join(brainDir, 'redesign_login_page.png') });
  console.log("✅ Saved redesign_login_page.png");

  // 2. Log in as Yodier (Admin)
  console.log("🔑 Logging in as Admin (yodiermurillo@gmail.com)...");
  await page.type('input[type="email"]', 'yodiermurillo@gmail.com');
  await page.type('input[type="password"]', 'yoi1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // 3. Admin Dashboard
  console.log("📸 Capturing admin dashboard...");
  await page.waitForSelector('main');
  await page.waitForSelector('aside');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(brainDir, 'redesign_admin_dashboard.png') });
  console.log("✅ Saved redesign_admin_dashboard.png");

  // 4. Click Admin Tools in Sidebar
  console.log("🖱️ Navigating to Herramientas Admin...");
  await page.hover('aside');
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a, aside button'));
    const toolsBtn = links.find(el => el.textContent.includes('Herramientas Admin') || el.textContent.includes('Admin Tools'));
    if (!toolsBtn) throw new Error('Admin tools button not found in sidebar');
    toolsBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  console.log("📸 Capturing admin tools hub...");
  await page.screenshot({ path: path.join(brainDir, 'redesign_admin_tools_main.png') });
  console.log("✅ Saved redesign_admin_tools_main.png");

  // 5. Open Auditoría de Clientes
  console.log("🖱️ Clicking Auditoría de Clientes...");
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('main div, main button'));
    const auditCard = cards.find(el => el.textContent.includes('Auditoría de Clientes'));
    if (!auditCard) throw new Error('Auditoría de Clientes card not found');
    auditCard.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 6. Open client details modal
  console.log("🖱️ Opening first client card details modal...");
  await page.evaluate(() => {
    const clientCards = Array.from(document.querySelectorAll('main div'));
    const clientCard = clientCards.find(el => el.textContent.includes('Alejandro Gómez') || el.textContent.includes('DNI/NIE'));
    if (!clientCard) throw new Error('Client card not found in Auditoría');
    clientCard.click();
  });
  await new Promise(r => setTimeout(r, 1500)); // wait for modal transition
  console.log("📸 Capturing client details modal...");
  await page.screenshot({ path: path.join(brainDir, 'redesign_admin_client_details.png') });
  console.log("✅ Saved redesign_admin_client_details.png");

  // Close modal via clicking the close button specifically
  console.log("🖱️ Closing client details modal...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const closeBtn = buttons.find(b => b.textContent.includes('Cerrar Ficha') || b.textContent.includes('Cerrar') || b.textContent.includes('×'));
    if (!closeBtn) throw new Error('Close button not found in modal');
    closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 7. Log out or navigate back to root if fast refresh happened
  console.log("🚪 Handling log out...");
  const currentUrl = page.url();
  if (currentUrl.includes('/dashboard')) {
    await page.waitForSelector('aside', { visible: true, timeout: 5000 }).catch(() => {});
    const asideExists = await page.$('aside');
    if (asideExists) {
      await page.hover('aside');
      await new Promise(r => setTimeout(r, 300));
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('aside button'));
        const logoutBtn = buttons.find(b => b.textContent.includes('Cerrar Sesión'));
        if (logoutBtn) logoutBtn.click();
      });
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    }
  } else {
    console.log("Page was already redirected or refreshed back to:", currentUrl);
  }

  // 8. Log in as Client (Alejandro Gomez)
  console.log("🔑 Logging in as Client (alejandro.gomez@gmail.com)...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'alejandro.gomez@gmail.com');
  await page.type('input[type="password"]', 'user_secure_password');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // 9. Client Dashboard
  console.log("📸 Capturing client dashboard...");
  await page.waitForSelector('main');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(brainDir, 'redesign_client_dashboard.png') });
  console.log("✅ Saved redesign_client_dashboard.png");

  await browser.close();
  console.log("✨ All visual screenshots captured successfully!");
}

run().catch(err => {
  console.error("❌ Visual captures failed:", err);
  process.exit(1);
});
