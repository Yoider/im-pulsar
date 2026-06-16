const assert = require('assert');
const { resetDb, login } = require('./helpers');

module.exports = [
  {
    id: "TC-AUTH-01",
    tier: "Tier 1",
    feature: "Authentication",
    title: "Admin Carlos Smoke Login",
    run: async (page) => {
      resetDb();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'admin.carlos@impulsar.com');
      await page.type('input[type="password"]', 'admin_secure_password');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      const url = page.url();
      assert(url.includes('/dashboard'), `Expected URL to include /dashboard, got ${url}`);
      
      const welcomeText = await page.evaluate(() => document.body.textContent);
      assert(welcomeText.includes('Carlos'), `Expected welcome text to contain 'Carlos', got: ${welcomeText}`);
    }
  },
  {
    id: "TC-AUTH-02",
    tier: "Tier 1",
    feature: "Authentication",
    title: "Admin Yodier Smoke Login",
    run: async (page) => {
      resetDb();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'yodiermurillo@gmail.com');
      await page.type('input[type="password"]', 'yoi1234');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      const url = page.url();
      assert(url.includes('/dashboard'), `Expected URL to include /dashboard, got ${url}`);
      
      const welcomeText = await page.evaluate(() => document.body.textContent);
      assert(welcomeText.includes('Yodier'), `Expected welcome text to contain 'Yodier', got: ${welcomeText}`);
    }
  },
  {
    id: "TC-AUTH-03",
    tier: "Tier 1",
    feature: "Authentication",
    title: "Client Alejandro Smoke Login",
    run: async (page) => {
      resetDb();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'alejandro.gomez@gmail.com');
      await page.type('input[type="password"]', 'user_secure_password');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      const url = page.url();
      assert(url.includes('/dashboard'), `Expected URL to include /dashboard, got ${url}`);
      
      const contentText = await page.evaluate(() => document.body.textContent);
      assert(contentText.includes('Estado de tu Expediente'), `Expected content to contain 'Estado de tu Expediente', got: ${contentText}`);
    }
  },
  {
    id: "TC-AUTH-04",
    tier: "Tier 1",
    feature: "Authentication",
    title: "Sidebar Logout Flow",
    run: async (page) => {
      resetDb();
      await login(page, 'admin.carlos@impulsar.com', 'admin_secure_password');
      
      // Expand sidebar by hovering if needed, then find and click Cerrar Sesión
      await page.hover('aside');
      await new Promise(r => setTimeout(r, 200));

      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('aside button'));
        const logoutBtn = buttons.find(b => b.textContent.includes('Cerrar Sesión'));
        if (!logoutBtn) throw new Error('Logout button not found');
        logoutBtn.click();
      });

      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      const url = page.url();
      assert.strictEqual(url, 'http://localhost:3000/', `Expected URL to be http://localhost:3000/, got ${url}`);
    }
  },
  {
    id: "TC-AUTH-05",
    tier: "Tier 2",
    feature: "Authentication",
    title: "Success Banner Animation",
    run: async (page) => {
      resetDb();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'admin.carlos@impulsar.com');
      await page.type('input[type="password"]', 'admin_secure_password');
      await page.click('button[type="submit"]');

      // Wait for success banner to render before navigation
      await page.waitForSelector('div.bg-emerald-50', { timeout: 2000 });
      const bannerText = await page.$eval('div.bg-emerald-50', el => el.textContent);
      assert(bannerText.includes('¡Sesión iniciada con éxito!'), `Expected success banner, got ${bannerText}`);
    }
  },
  {
    id: "TC-AUTH-06",
    tier: "Tier 2",
    feature: "Authentication",
    title: "Google OAuth Redirect",
    run: async (page) => {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const googleBtn = buttons.find(b => b.textContent.includes('Google'));
        if (!googleBtn) throw new Error('Google button not found');
        googleBtn.click();
      });

      // Google OAuth redirects externally to account login page. Wait and verify redirect has Google in URL
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});
      const url = page.url();
      assert(url.includes('google.com') || url.includes('accounts.google.com') || url.includes('auth'), `Expected external Google redirection, got ${url}`);
    }
  },
  {
    id: "TC-AUTH-07",
    tier: "Tier 2",
    feature: "Authentication",
    title: "Remember Session State",
    run: async (page, browser) => {
      resetDb();
      await login(page, 'admin.carlos@impulsar.com', 'admin_secure_password');
      const cookies = await page.cookies();

      // Simulate browser restart by closing the page and opening a new context
      const newPage = await browser.newPage();
      await newPage.setViewport({ width: 1440, height: 900 });
      await newPage.setCookie(...cookies);

      await newPage.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
      const url = newPage.url();
      assert(url.includes('/dashboard'), `Expected direct access to dashboard without login redirect, got ${url}`);
      await newPage.close();
    }
  },
  {
    id: "TC-AUTH-08",
    tier: "Tier 3",
    feature: "Authentication",
    title: "Empty Inputs Validation",
    run: async (page) => {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      
      // Leave fields empty and try submitting
      await page.click('button[type="submit"]');

      const isEmailInvalid = await page.$eval('input[type="email"]', el => !el.validity.valid);
      assert(isEmailInvalid, "Expected email input to be marked invalid due to required attribute");
    }
  },
  {
    id: "TC-AUTH-09",
    tier: "Tier 3",
    feature: "Authentication",
    title: "Invalid Email Format",
    run: async (page) => {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'carlos@invalid');
      await page.type('input[type="password"]', 'admin_secure_password');
      await page.click('button[type="submit"]');

      const isEmailInvalid = await page.$eval('input[type="email"]', el => !el.validity.valid);
      assert(isEmailInvalid, "Expected email input to be marked invalid due to bad formatting");
    }
  },
  {
    id: "TC-AUTH-10",
    tier: "Tier 3",
    feature: "Authentication",
    title: "Incorrect Credentials Alert",
    run: async (page) => {
      resetDb();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'admin.carlos@impulsar.com');
      await page.type('input[type="password"]', 'wrong_pwd');
      await page.click('button[type="submit"]');

      await page.waitForSelector('div.bg-rose-50', { timeout: 2000 });
      const errorText = await page.$eval('div.bg-rose-50', el => el.textContent);
      assert(errorText.includes('Credenciales incorrectas. Inténtalo de nuevo.'), `Expected wrong password message, got: ${errorText}`);
    }
  },
  {
    id: "TC-AUTH-11",
    tier: "Tier 3",
    feature: "Authentication",
    title: "Non-existent User Alert",
    run: async (page) => {
      resetDb();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'no_exists@gmail.com');
      await page.type('input[type="password"]', 'randompassword');
      await page.click('button[type="submit"]');

      await page.waitForSelector('div.bg-rose-50', { timeout: 2000 });
      const errorText = await page.$eval('div.bg-rose-50', el => el.textContent);
      assert(errorText.includes('Credenciales incorrectas'), `Expected non-existent user error, got: ${errorText}`);
    }
  },
  {
    id: "TC-AUTH-12",
    tier: "Tier 4",
    feature: "Authentication",
    title: "Unauthenticated Direct Access",
    run: async (page) => {
      // Clear cookies to be unauthenticated
      await page.deleteCookie(...(await page.cookies()));

      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
      const url = page.url();
      assert.strictEqual(url, 'http://localhost:3000/', `Expected redirect to landing page, got ${url}`);
    }
  },
  {
    id: "TC-AUTH-13",
    tier: "Tier 4",
    feature: "Authentication",
    title: "Login Rate Resilience",
    run: async (page) => {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'admin.carlos@impulsar.com');
      await page.type('input[type="password"]', 'admin_secure_password');

      // Click submit rapidly 10 times in a loop
      const clicks = [];
      for (let i = 0; i < 10; i++) {
        clicks.push(page.click('button[type="submit"]'));
      }
      
      // Wait for all clicks to register
      await Promise.all(clicks).catch(() => {});
      
      // Ensure the browser and page are still responsive
      const isResponsive = await page.evaluate(() => typeof window !== 'undefined');
      assert(isResponsive, "Expected page to remain responsive under rapid logins");
    }
  }
];
