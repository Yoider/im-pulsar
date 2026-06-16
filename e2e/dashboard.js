const assert = require('assert');
const { resetDb, login, createTempFile, deleteTempFile, executeDbQuery } = require('./helpers');

module.exports = [
  {
    id: "TC-DASH-01",
    tier: "Tier 1",
    feature: "Client Dashboard",
    title: "View Welcome Banner",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      const welcomeText = await page.$eval('h2', el => el.textContent);
      assert(welcomeText.includes('Hola, Alejandro'), `Expected welcome text for Alejandro, got: ${welcomeText}`);
    }
  },
  {
    id: "TC-DASH-02",
    tier: "Tier 1",
    feature: "Client Dashboard",
    title: "View Dossier Progress Card",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      const progressCardTitle = await page.$eval('h3', el => el.textContent);
      assert(progressCardTitle.includes('Estado de tu Expediente'), `Expected 'Estado de tu Expediente', got: ${progressCardTitle}`);
    }
  },
  {
    id: "TC-DASH-03",
    tier: "Tier 1",
    feature: "Client Dashboard",
    title: "Sidebar Hover Expansion",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      const widthBefore = await page.$eval('aside', el => el.getBoundingClientRect().width);
      
      // Hover over aside
      await page.hover('aside');
      await new Promise(r => setTimeout(r, 450)); // Wait for transition
      
      const widthAfter = await page.$eval('aside', el => el.getBoundingClientRect().width);
      
      assert(widthAfter > widthBefore, `Expected sidebar width to increase on hover, went from ${widthBefore} to ${widthAfter}`);
    }
  },
  {
    id: "TC-DASH-04",
    tier: "Tier 1",
    feature: "Client Dashboard",
    title: "Admin Actions Hidden",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      // Ensure no Herramientas Admin or Docs are visible on dashboard
      const buttonTexts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a')).map(el => el.textContent.trim());
      });
      
      const hasAdminTools = buttonTexts.some(text => text.includes('Herramientas Admin') || text.includes('Docs'));
      assert(!hasAdminTools, "Expected admin options to be hidden from client");
    }
  },
  {
    id: "TC-DASH-05",
    tier: "Tier 2",
    feature: "Client Dashboard",
    title: "Steps Checklist Display",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      // Wait for steps container or steps layout elements to display
      // Note: Alejandro Gómez has 4 steps assigned. DNI, Nómina, Contrato, WhatsApp ID.
      // If client view does not render steps yet, this will fail as expected.
      await page.waitForSelector('.step-item, [data-testid="step-card"]', { timeout: 3000 });
      const stepCount = await page.$$eval('.step-item, [data-testid="step-card"]', els => els.length);
      assert.strictEqual(stepCount, 4, `Expected 4 steps for Alejandro Gomez, found ${stepCount}`);
    }
  },
  {
    id: "TC-DASH-06",
    tier: "Tier 2",
    feature: "Client Dashboard",
    title: "Mandatory Badge Validation",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      // Look for step cards and check if mandatory steps show "Obligatorio"
      await page.waitForSelector('.step-item, [data-testid="step-card"]', { timeout: 3000 });
      
      const stepBadges = await page.evaluate(() => {
        const steps = Array.from(document.querySelectorAll('.step-item, [data-testid="step-card"]'));
        return steps.map(s => {
          const name = s.querySelector('.step-name, h4')?.textContent || '';
          const hasMandatory = s.textContent.includes('Obligatorio');
          return { name, hasMandatory };
        });
      });
      
      const dniStep = stepBadges.find(s => s.name.includes('Identidad') || s.name.includes('DNI'));
      const whatsappStep = stepBadges.find(s => s.name.includes('WhatsApp'));
      
      assert(dniStep, "Expected to find Identity / DNI step");
      assert(dniStep.hasMandatory, "Identity / DNI step should be marked as Obligatorio");
      
      if (whatsappStep) {
        assert(!whatsappStep.hasMandatory, "WhatsApp step should NOT be marked as Obligatorio");
      }
    }
  },
  {
    id: "TC-DASH-07",
    tier: "Tier 2",
    feature: "Client Dashboard",
    title: "Upload File to Pending Step",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      await page.waitForSelector('.step-item, [data-testid="step-card"]', { timeout: 3000 });
      
      // Generate temporary PDF file
      const tempPdf = createTempFile('contrato_alejandro.pdf');
      
      try {
        // Find file input corresponding to "Contrato de Adhesión Firmado"
        const inputSelector = 'input[type="file"]'; // adjust if we have specific step inputs
        await page.waitForSelector(inputSelector, { timeout: 2000 });
        
        // Upload file
        const fileInput = await page.$(inputSelector);
        await fileInput.uploadFile(tempPdf);
        
        // Wait for upload update and check status badge
        await page.waitForFunction(() => {
          return document.body.textContent.includes('Subido') || document.body.textContent.includes('Uploaded');
        }, { timeout: 5000 });
        
        const pageText = await page.evaluate(() => document.body.textContent);
        assert(pageText.includes('Subido') || pageText.includes('Uploaded'), "Expected status to update to Subido / Uploaded");
      } finally {
        deleteTempFile(tempPdf);
      }
    }
  },
  {
    id: "TC-DASH-08",
    tier: "Tier 2",
    feature: "Client Dashboard",
    title: "Upload Text Value Input",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      await page.waitForSelector('.step-item, [data-testid="step-card"]', { timeout: 3000 });
      
      // WhatsApp ID text input
      const inputSelector = '.step-item input[type="text"], [data-testid="step-card"] input[type="text"]';
      await page.waitForSelector(inputSelector, { timeout: 2000 });
      
      await page.type(inputSelector, '+34612345678');
      
      // Submit
      const submitBtnSelector = '.step-item button[type="submit"], [data-testid="step-card"] button';
      await page.click(submitBtnSelector);
      
      // Check saved successfully feedback or text preservation
      await new Promise(r => setTimeout(r, 1000));
      const value = await page.$eval(inputSelector, el => el.value);
      assert.strictEqual(value, '+34612345678', `Expected WhatsApp input value to be saved, got ${value}`);
    }
  },
  {
    id: "TC-DASH-09",
    tier: "Tier 3",
    feature: "Client Dashboard",
    title: "View Rejection Admin Comments",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      // In seeded data: step 2 (Nómina) is Rejected and has comments
      await page.waitForSelector('.step-item, [data-testid="step-card"]', { timeout: 3000 });
      
      const pageText = await page.evaluate(() => document.body.textContent);
      assert(pageText.includes('La nómina aportada corresponde al año anterior'), "Expected to see admin rejection comments for the Nómina step");
    }
  },
  {
    id: "TC-DASH-10",
    tier: "Tier 3",
    feature: "Client Dashboard",
    title: "Empty Dossier View",
    run: async (page) => {
      resetDb();
      // Set Alejandro Gómez rootsTypeId to null dynamically in database
      await executeDbQuery(async (prisma) => {
        await prisma.user.updateMany({
          where: { email: 'alejandro.gomez@gmail.com' },
          data: { rootsTypeId: null }
        });
      });
      
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      const pageText = await page.evaluate(() => document.body.textContent);
      assert(pageText.includes('Sin expediente asignado') || pageText.includes('no tiene ningún expediente o paso asignado'), `Expected empty dossier view message, got: ${pageText}`);
    }
  },
  {
    id: "TC-DASH-11",
    tier: "Tier 4",
    feature: "Client Dashboard",
    title: "Bypass Role Route Guard",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      // Try to navigate directly to admin-tools page
      await page.goto('http://localhost:3000/dashboard/admin-tools', { waitUntil: 'networkidle2' }).catch(() => {});
      
      const url = page.url();
      assert(url.includes('/dashboard') && !url.includes('/admin-tools'), `Expected access to admin-tools to be blocked/redirected, got URL: ${url}`);
    }
  },
  {
    id: "TC-DASH-12",
    tier: "Tier 4",
    feature: "Client Dashboard",
    title: "Document Access Security",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      // Try to fetch another client's file path directly.
      // E.g. fetch /mock/dni_maria_completo.pdf via page request or simple fetch.
      const fetchResponseStatus = await page.evaluate(async () => {
        const res = await fetch('/mock/dni_maria_completo.pdf').catch(() => null);
        return res ? res.status : 500;
      });
      
      // Expected to be forbidden (403) or blocked (404/401)
      assert(fetchResponseStatus === 403 || fetchResponseStatus === 401 || fetchResponseStatus === 404, `Expected direct access to another user's file to be blocked, got status ${fetchResponseStatus}`);
    }
  },
  {
    id: "TC-DASH-13",
    tier: "Tier 4",
    feature: "Client Dashboard",
    title: "Invalid Upload Payload",
    run: async (page) => {
      resetDb();
      await login(page, 'alejandro.gomez@gmail.com', 'user_secure_password');
      
      await page.waitForSelector('.step-item, [data-testid="step-card"]', { timeout: 3000 });
      
      const tempExe = createTempFile('malware.exe');
      
      try {
        const inputSelector = 'input[type="file"]';
        await page.waitForSelector(inputSelector, { timeout: 2000 });
        
        const fileInput = await page.$(inputSelector);
        await fileInput.uploadFile(tempExe);
        
        // Verify reject message/modal displays
        await page.waitForFunction(() => {
          return document.body.textContent.includes('no admitido') || document.body.textContent.includes('error') || document.body.textContent.includes('rejected') || document.body.textContent.includes('formato');
        }, { timeout: 3000 });
        
        const pageText = await page.evaluate(() => document.body.textContent);
        assert(pageText.toLowerCase().includes('error') || pageText.toLowerCase().includes('admit') || pageText.toLowerCase().includes('formato') || pageText.toLowerCase().includes('rechaz'), "Expected error message when uploading invalid file type");
      } finally {
        deleteTempFile(tempExe);
      }
    }
  }
];
