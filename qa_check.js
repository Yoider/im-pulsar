const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const paths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = '';
for (const p of paths) {
  if (fs.existsSync(p)) {
    executablePath = p;
    break;
  }
}

if (!executablePath) {
  console.error("No compatible browser found for Puppeteer!");
  process.exit(1);
}

console.log(`Using browser: ${executablePath}`);

const destDir = 'C:\\Users\\yodie\\.gemini\\antigravity\\brain\\dacb47b7-a9b8-46ef-972e-81b866e48f82';
fs.mkdirSync(destDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true, // Run headlessly
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set desktop viewport
  await page.setViewport({ width: 1440, height: 900 });

  // Capture console errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  console.log('Logging in as admin...');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin.carlos@impulsar.com');
  await page.type('input[type="password"]', 'admin_secure_password');
  
  // Click login
  await page.click('button[type="submit"]');

  console.log('Waiting for redirection...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Verify we are on dashboard
  console.log('Current URL:', page.url());

  // Wait for the "Herramientas Admin" button card on page using evaluate
  console.log('Clicking on Herramientas Admin...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Herramientas Admin'));
    if (btn) {
      btn.click();
    } else {
      // Try links/divs in case it is structured differently
      const elements = Array.from(document.querySelectorAll('a, div[role="button"]'));
      const found = elements.find(el => el.textContent.includes('Herramientas Admin'));
      if (found) {
        found.click();
      } else {
        throw new Error('Could not find Herramientas Admin element');
      }
    }
  });

  // Wait for the layout to render by checking body text content
  console.log('Waiting for Herramientas Administrativas view to load...');
  await page.waitForFunction(() => {
    return document.body.textContent.includes('Herramientas Administrativas');
  }, { timeout: 15000 });

  // Additional wait to ensure full layout stabilization
  await new Promise(r => setTimeout(r, 1000));
  
  // Take screenshot 05: proportions layout
  console.log('Taking screenshot 05_proportions_layout.png...');
  await page.screenshot({ path: path.join(destDir, '05_proportions_layout.png') });

  // Under right column, click/make sure tab is "Expedientes"
  // Hover over the first dossier card to reveal "Editar" and "Eliminar"
  console.log('Hovering over first Expediente card...');
  await page.waitForSelector('div.cursor-pointer.group', { timeout: 10000 });
  
  // Find a card element
  const cards = await page.$$('div.cursor-pointer.group');
  if (cards.length > 0) {
    await cards[0].hover();
    console.log('Hovered over first ExpedienteCard');
    // Wait for hover animations/transitions to complete
    await new Promise(r => setTimeout(r, 1000));
  } else {
    console.log('WARNING: No expediente cards found to hover!');
  }

  console.log('Taking screenshot 06_expedientes_list_view.png...');
  await page.screenshot({ path: path.join(destDir, '06_expedientes_list_view.png') });

  // Now, click the "Estados" tab using evaluate to be robust
  console.log('Clicking on Estados tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.trim() === 'Estados');
    if (btn) {
      btn.click();
    } else {
      throw new Error('Could not find Estados tab button');
    }
  });

  // Wait for Estados tab content to load
  console.log('Waiting for Estados content...');
  await page.waitForFunction(() => {
    return document.body.textContent.includes('ID:');
  }, { timeout: 10000 });
  
  await new Promise(r => setTimeout(r, 1000));

  // Hover over first state card to reveal action buttons
  console.log('Hovering over first Estado card...');
  const stateCards = await page.$$('div.group');
  if (stateCards.length > 0) {
    let stateCardToHover = null;
    for (const card of stateCards) {
      const isCursor = await card.evaluate(el => el.classList.contains('cursor-pointer'));
      if (!isCursor) {
        stateCardToHover = card;
        break;
      }
    }
    if (stateCardToHover) {
      await stateCardToHover.hover();
      console.log('Hovered over first Estado card');
      await new Promise(r => setTimeout(r, 1000));
    } else {
      console.log('WARNING: No non-cursor-pointer group cards found for Estados! Hovering first group card.');
      await stateCards[0].hover();
    }
  } else {
    console.log('WARNING: No state cards found to hover!');
  }

  console.log('Taking screenshot 07_estados_list_view.png...');
  await page.screenshot({ path: path.join(destDir, '07_estados_list_view.png') });

  console.log('Finished QA checks successfully!');
  await browser.close();
})().catch(err => {
  console.error('An error occurred during execution:', err);
  process.exit(1);
});
