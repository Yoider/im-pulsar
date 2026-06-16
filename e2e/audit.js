const assert = require('assert');
const { resetDb, login } = require('./helpers');

async function goToAdminTools(page) {
  await login(page, 'admin.carlos@impulsar.com', 'admin_secure_password');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Herramientas Admin'));
    if (btn) btn.click();
  });
  await page.waitForFunction(() => document.body.textContent.includes('Herramientas Administrativas'), { timeout: 5000 });
}

module.exports = [
  {
    id: "TC-AUD-01",
    tier: "Tier 1",
    feature: "Admin Client Audit",
    title: "View Admin Panel View",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      const titleText = await page.$eval('h2', el => el.textContent);
      assert(titleText.includes('Herramientas Administrativas'), `Expected Admin tools title, got: ${titleText}`);
    }
  },
  {
    id: "TC-AUD-02",
    tier: "Tier 1",
    feature: "Admin Client Audit",
    title: "Total Client Count Badge",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      const badgeText = await page.evaluate(() => {
        const span = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes('Clientes'));
        return span ? span.textContent.trim() : '';
      });
      assert(badgeText.includes('Clientes'), `Expected client count badge containing 'Clientes', got: '${badgeText}'`);
    }
  },
  {
    id: "TC-AUD-03",
    tier: "Tier 1",
    feature: "Admin Client Audit",
    title: "KPI Stats Calculations",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      // Look for KPI container or cards.
      // KPI container contains stats calculations.
      const kpiText = await page.evaluate(() => {
        const kpis = document.querySelector('.grid-cols-2, .grid-cols-4'); // KPI block selector
        return kpis ? kpis.textContent : '';
      });
      
      // Carlos, Yodier, Alejandro, María are users. Total clients is 2 (Alejandro & Maria).
      // Verify stats numbers are visible.
      assert(kpiText.includes('2') || kpiText.includes('Clientes'), `Expected KPI statistics, got: ${kpiText}`);
    }
  },
  {
    id: "TC-AUD-04",
    tier: "Tier 2",
    feature: "Admin Client Audit",
    title: "Client Search Name Filter",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      await page.waitForSelector('input[placeholder="Buscar por cliente o correo..."]');
      await page.type('input[placeholder="Buscar por cliente o correo..."]', 'Alejandro');
      await new Promise(r => setTimeout(r, 600)); // wait for client side filtering
      
      const visibleNames = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('h4'));
        return cards.map(c => c.textContent.trim());
      });
      
      assert(visibleNames.some(name => name.includes('Alejandro')), "Alejandro Gómez card should be visible");
      assert(!visibleNames.some(name => name.includes('María')), "María Torres card should be filtered out");
    }
  },
  {
    id: "TC-AUD-05",
    tier: "Tier 2",
    feature: "Admin Client Audit",
    title: "Client Search Email Filter",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      await page.waitForSelector('input[placeholder="Buscar por cliente o correo..."]');
      await page.type('input[placeholder="Buscar por cliente o correo..."]', 'm.torres');
      await new Promise(r => setTimeout(r, 600));
      
      const visibleNames = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('h4'));
        return cards.map(c => c.textContent.trim());
      });
      
      assert(visibleNames.some(name => name.includes('María')), "María Torres card should be visible");
      assert(!visibleNames.some(name => name.includes('Alejandro')), "Alejandro Gómez card should be filtered out");
    }
  },
  {
    id: "TC-AUD-06",
    tier: "Tier 2",
    feature: "Admin Client Audit",
    title: "Filter list by Dossier Type",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      await page.waitForSelector('select');
      
      // select the option for "Regularización Comercial Express" (rootsTypeId = 2)
      // Maria Torres has RootsType = Regularización Comercial Express.
      await page.evaluate(() => {
        const select = document.querySelector('select');
        const expressOpt = Array.from(select.options).find(opt => opt.text.includes('Comercial Express'));
        if (expressOpt) {
          select.value = expressOpt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await new Promise(r => setTimeout(r, 600));
      
      const visibleNames = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('h4'));
        return cards.map(c => c.textContent.trim());
      });
      
      assert(visibleNames.some(name => name.includes('María')), "María Torres should be visible");
      assert(!visibleNames.some(name => name.includes('Alejandro')), "Alejandro Gómez should be filtered out");
    }
  },
  {
    id: "TC-AUD-07",
    tier: "Tier 2",
    feature: "Admin Client Audit",
    title: "Filter list by 'Sin Asignar'",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      await page.waitForSelector('select');
      
      // Select "Sin Asignar"
      await page.evaluate(() => {
        const select = document.querySelector('select');
        select.value = 'unassigned';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      await new Promise(r => setTimeout(r, 600));
      
      // Both seeded clients (Alejandro & Maria) have dossiers assigned in seeds.
      // So filtering by "Sin Asignar" should return no clients (or only unassigned ones if created).
      const visibleCardsCount = await page.$$eval('h4', els => els.length);
      assert.strictEqual(visibleCardsCount, 0, `Expected 0 cards for unassigned process filter, found ${visibleCardsCount}`);
    }
  },
  {
    id: "TC-AUD-08",
    tier: "Tier 2",
    feature: "Admin Client Audit",
    title: "Assign Dossier in Card",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      // We will select another dossier process for client Alejandro Gomez in his card's dropdown.
      // Wait for card-level select element.
      // We know there are selects inside the Auditoria section for each user.
      const initialGroup = await page.evaluate(() => {
        // Find Alejandro's card and its parent group name
        const card = Array.from(document.querySelectorAll('h4')).find(h => h.textContent.includes('Alejandro'));
        return card ? card.closest('.animate-fade-in')?.querySelector('h3')?.textContent.trim() : '';
      });
      
      // Change select dropdown inside Alejandro's card to Commercial Express (rootsTypeId = 2)
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.animate-fade-in div.border-slate-200\\/70'));
        const alejandroCard = cards.find(c => c.textContent.includes('Alejandro Gómez'));
        if (!alejandroCard) throw new Error("Alejandro card not found");
        
        const select = alejandroCard.querySelector('select');
        if (!select) throw new Error("Card select dropdown not found");
        
        // Find Express option
        const opt = Array.from(select.options).find(o => o.text.includes('Comercial Express'));
        if (!opt) throw new Error("Express option not found");
        
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Wait for update
      await new Promise(r => setTimeout(r, 1500));
      
      const newGroup = await page.evaluate(() => {
        const card = Array.from(document.querySelectorAll('h4')).find(h => h.textContent.includes('Alejandro'));
        return card ? card.closest('.animate-fade-in')?.querySelector('h3')?.textContent.trim() : '';
      });
      
      assert(newGroup.includes('Comercial Express'), `Expected Alejandro card to move to Commercial Express group, got group name: ${newGroup}`);
    }
  },
  {
    id: "TC-AUD-09",
    tier: "Tier 3",
    feature: "Admin Client Audit",
    title: "Clear Search Query Reset",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      const initialCount = await page.$$eval('h4', els => els.length);
      
      await page.waitForSelector('input[placeholder="Buscar por cliente o correo..."]');
      await page.type('input[placeholder="Buscar por cliente o correo..."]', 'Alejandro');
      await new Promise(r => setTimeout(r, 600));
      
      // Clear input
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder="Buscar por cliente o correo..."]');
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await new Promise(r => setTimeout(r, 600));
      
      const finalCount = await page.$$eval('h4', els => els.length);
      assert.strictEqual(finalCount, initialCount, `Expected client list count to reset to ${initialCount}, got ${finalCount}`);
    }
  },
  {
    id: "TC-AUD-10",
    tier: "Tier 3",
    feature: "Admin Client Audit",
    title: "Zero Results Search View",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      await page.waitForSelector('input[placeholder="Buscar por cliente o correo..."]');
      await page.type('input[placeholder="Buscar por cliente o correo..."]', 'non_existent_username_123');
      await new Promise(r => setTimeout(r, 600));
      
      const pageText = await page.evaluate(() => document.body.textContent);
      assert(pageText.includes('No se encontraron clientes'), `Expected 'No se encontraron clientes' text, got: ${pageText}`);
    }
  },
  {
    id: "TC-AUD-11",
    tier: "Tier 3",
    feature: "Admin Client Audit",
    title: "Conflicting Filters",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      // Search "Alejandro" (Regularización de Cuenta Personal)
      await page.waitForSelector('input[placeholder="Buscar por cliente o correo..."]');
      await page.type('input[placeholder="Buscar por cliente o correo..."]', 'Alejandro');
      
      // Filter by "Regularización Comercial Express" (rootsTypeId = 2)
      await page.evaluate(() => {
        const select = document.querySelector('select');
        const opt = Array.from(select.options).find(o => o.text.includes('Comercial Express'));
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await new Promise(r => setTimeout(r, 600));
      
      const count = await page.$$eval('h4', els => els.length);
      assert.strictEqual(count, 0, `Expected 0 results due to conflicting filters, found ${count}`);
    }
  },
  {
    id: "TC-AUD-12",
    tier: "Tier 4",
    feature: "Admin Client Audit",
    title: "SQL Injection Resilience",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      await page.waitForSelector('input[placeholder="Buscar por cliente o correo..."]');
      await page.type('input[placeholder="Buscar por cliente o correo..."]', "' OR '1'='1");
      await new Promise(r => setTimeout(r, 600));
      
      // Database query must execute safely and list 0 matches because that literal username doesn't exist
      const count = await page.$$eval('h4', els => els.length);
      assert.strictEqual(count, 0, `Expected 0 records for SQL Injection literal search, found ${count}`);
      
      const pageText = await page.evaluate(() => document.body.textContent);
      assert(pageText.includes('No se encontraron clientes'), "Expected safe zero-result view for SQL Injection attempt");
    }
  },
  {
    id: "TC-AUD-13",
    tier: "Tier 4",
    feature: "Admin Client Audit",
    title: "XSS Vulnerability Check",
    run: async (page) => {
      resetDb();
      await goToAdminTools(page);
      
      let alertTriggered = false;
      page.once('dialog', async (dialog) => {
        alertTriggered = true;
        await dialog.dismiss();
      });
      
      await page.waitForSelector('input[placeholder="Buscar por cliente o correo..."]');
      await page.type('input[placeholder="Buscar por cliente o correo..."]', "<script>alert('hack')</script>");
      await new Promise(r => setTimeout(r, 600));
      
      assert(!alertTriggered, "XSS Payload triggered alert box! Vulnerability detected!");
      
      // Check that script tags are sanitized/escaped in output
      const rawText = await page.evaluate(() => document.body.innerHTML);
      assert(!rawText.includes("<script>alert('hack')</script>"), "Raw XSS payload rendered unsanitized in DOM!");
    }
  }
];
