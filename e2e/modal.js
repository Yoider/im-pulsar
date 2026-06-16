const assert = require('assert');
const { resetDb, login, createTempFile, deleteTempFile, executeDbQuery } = require('./helpers');

async function goToAdminToolsAndOpenModal(page) {
  await login(page, 'admin.carlos@impulsar.com', 'admin_secure_password');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Herramientas Admin'));
    if (btn) btn.click();
  });
  await page.waitForFunction(() => document.body.textContent.includes('Herramientas Administrativas'), { timeout: 5000 });
  
  // Click on Alejandro Gomez card to open split modal
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.animate-fade-in div.border-slate-200\\/70'));
    const alejandroCard = cards.find(c => c.textContent.includes('Alejandro Gómez'));
    if (alejandroCard) alejandroCard.click();
  });
  
  await page.waitForFunction(() => document.body.textContent.includes('Ficha Detallada del Cliente'), { timeout: 5000 });
}

module.exports = [
  {
    id: "TC-MOD-01",
    tier: "Tier 1",
    feature: "Admin Split Modal",
    title: "Open Client Split Modal",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      const modalHeader = await page.$eval('h3.text-base.font-bold, h3.text-lg.font-extrabold', el => el.textContent);
      assert(modalHeader.includes('Alejandro Gómez'), `Expected client name in split modal header, got: ${modalHeader}`);
    }
  },
  {
    id: "TC-MOD-02",
    tier: "Tier 1",
    feature: "Admin Split Modal",
    title: "View Client Details Left Column",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      const detailsText = await page.evaluate(() => {
        const leftCol = document.querySelector('.grid-cols-1.md\\:grid-cols-3 > div:first-child');
        return leftCol ? leftCol.textContent : '';
      });
      
      assert(detailsText.includes('NIE'), "Expected NIE label in left column");
      assert(detailsText.includes('Teléfono / WA'), "Expected Phone / WhatsApp label in left column");
      assert(detailsText.includes('Fecha Cita'), "Expected Appointment Date label in left column");
    }
  },
  {
    id: "TC-MOD-03",
    tier: "Tier 1",
    feature: "Admin Split Modal",
    title: "Close Split Modal",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      // Click Cerrar Ficha button
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cerrar Ficha'));
        if (btn) btn.click();
      });
      
      await new Promise(r => setTimeout(r, 600));
      const hasModal = await page.evaluate(() => document.body.textContent.includes('Ficha Detallada del Cliente'));
      assert(!hasModal, "Expected split modal to close and no longer display 'Ficha Detallada del Cliente'");
    }
  },
  {
    id: "TC-MOD-04",
    tier: "Tier 2",
    feature: "Admin Split Modal",
    title: "Toggle Edit Mode",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      // Click "Editar" button on client card (left column)
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Editar'));
        if (btn) btn.click();
      });
      
      await page.waitForSelector('input[type="text"]', { timeout: 2000 });
      const editFieldsVisible = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
        return inputs.length > 0;
      });
      assert(editFieldsVisible, "Expected text inputs to become visible when edit mode is toggled");
    }
  },
  {
    id: "TC-MOD-05",
    tier: "Tier 2",
    feature: "Admin Split Modal",
    title: "Save Edited Client Details",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      // Click Edit
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Editar'));
        if (btn) btn.click();
      });
      
      await page.waitForSelector('input[type="text"]', { timeout: 2000 });
      
      // Clear last name field and enter new name
      await page.evaluate(() => {
        // Find input for lastname (it is the second text input usually)
        const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
        // Let's set both name and lastname clearly
        inputs[0].value = 'Alejandro';
        inputs[1].value = 'Gómez Modificado';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      });
      
      // Click "Guardar"
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Guardar');
        if (btn) btn.click();
      });
      
      await new Promise(r => setTimeout(r, 1500));
      
      // Verify static text reflects changes
      const headerText = await page.$eval('h3.text-lg.font-extrabold', el => el.textContent);
      assert(headerText.includes('Gómez Modificado'), `Expected updated last name to display in modal header, got: ${headerText}`);
    }
  },
  {
    id: "TC-MOD-06",
    tier: "Tier 2",
    feature: "Admin Split Modal",
    title: "Open Google Drive Link",
    run: async (page) => {
      resetDb();
      // Configure drive folder URL first
      await executeDbQuery(async (prisma) => {
        await prisma.user.updateMany({
          where: { email: 'alejandro.gomez@gmail.com' },
          data: { driveFolderUrl: 'https://drive.google.com/drive/folders/123456789_test' }
        });
      });
      
      await goToAdminToolsAndOpenModal(page);
      
      const linkHref = await page.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(el => el.textContent.includes('Ver Carpeta'));
        return link ? link.href : '';
      });
      
      assert.strictEqual(linkHref, 'https://drive.google.com/drive/folders/123456789_test', `Expected Google Drive link, got: ${linkHref}`);
    }
  },
  {
    id: "TC-MOD-07",
    tier: "Tier 2",
    feature: "Admin Split Modal",
    title: "Upload Passport File",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      const tempPdf = createTempFile('passport_test.pdf');
      
      try {
        const fileInput = await page.$('input[type="file"]');
        assert(fileInput, "Passport file input not found");
        
        await fileInput.uploadFile(tempPdf);
        await new Promise(r => setTimeout(r, 1500));
        
        const text = await page.evaluate(() => document.body.textContent);
        assert(text.includes('Ver Archivo'), "Expected Passport link to change to Ver Archivo");
        assert(text.includes('Subido') || text.includes('Uploaded'), "Expected Passport status to show Subido / Uploaded");
      } finally {
        deleteTempFile(tempPdf);
      }
    }
  },
  {
    id: "TC-MOD-08",
    tier: "Tier 2",
    feature: "Admin Split Modal",
    title: "Approve Step Status",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      // Select step status dropdown, choose "Approved"
      await page.evaluate(() => {
        // Alejandro's step 3 is Contrato (Pending)
        // Find select elements in modal
        const selects = Array.from(document.querySelectorAll('.md\\:col-span-2 select'));
        // Select the one for Contrato
        const contratoSelect = selects[2]; // DNI, Nómina, Contrato
        if (!contratoSelect) throw new Error("Contrato select dropdown not found");
        
        contratoSelect.value = 'Approved';
        contratoSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      await new Promise(r => setTimeout(r, 1500));
      
      // Check that step shows Aprobado/Approved
      const approvedVisible = await page.evaluate(() => {
        const select = Array.from(document.querySelectorAll('.md\\:col-span-2 select'))[2];
        return select ? select.value === 'Approved' : false;
      });
      
      assert(approvedVisible, "Expected step status dropdown value to be Approved");
    }
  },
  {
    id: "TC-MOD-09",
    tier: "Tier 2",
    feature: "Admin Split Modal",
    title: "Reject Step Status",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('.md\\:col-span-2 select'));
        const contratoSelect = selects[2];
        if (!contratoSelect) throw new Error("Contrato select not found");
        contratoSelect.value = 'Rejected';
        contratoSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      await new Promise(r => setTimeout(r, 1500));
      
      const rejectedVisible = await page.evaluate(() => {
        const select = Array.from(document.querySelectorAll('.md\\:col-span-2 select'))[2];
        return select ? select.value === 'Rejected' : false;
      });
      
      assert(rejectedVisible, "Expected step status dropdown value to be Rejected");
    }
  },
  {
    id: "TC-MOD-10",
    tier: "Tier 2",
    feature: "Admin Split Modal",
    title: "Admin Uploads Step Document",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      const tempPdf = createTempFile('contract_on_behalf.pdf');
      
      try {
        // Find step 3 (Contrato) upload input
        const fileInputs = await page.$$('.md\\:col-span-2 input[type="file"]');
        const contratoInput = fileInputs[2]; // DNI, Nómina, Contrato
        assert(contratoInput, "Contrato step file input not found");
        
        await contratoInput.uploadFile(tempPdf);
        await new Promise(r => setTimeout(r, 1500));
        
        const docLinkText = await page.evaluate(() => {
          return document.body.textContent;
        });
        
        assert(docLinkText.includes('contract_on_behalf.pdf'), "Expected uploaded contract document link to be visible");
      } finally {
        deleteTempFile(tempPdf);
      }
    }
  },
  {
    id: "TC-MOD-11",
    tier: "Tier 3",
    feature: "Admin Split Modal",
    title: "Clear Appointment Date",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      // Click edit
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Editar'));
        if (btn) btn.click();
      });
      
      await page.waitForSelector('input[type="date"]', { timeout: 2000 });
      
      // Clear appointment date input
      await page.evaluate(() => {
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput) {
          dateInput.value = '';
          dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      
      // Click Guardar
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Guardar');
        if (btn) btn.click();
      });
      
      await new Promise(r => setTimeout(r, 1500));
      
      // Verify that appointment Date displays as "Sin cita"
      const dateText = await page.evaluate(() => {
        const spans = Array.from(document.querySelectorAll('span'));
        const appointmentSpan = spans.find(s => s.previousElementSibling && s.previousElementSibling.textContent.includes('Fecha Cita'));
        return appointmentSpan ? appointmentSpan.textContent.trim() : '';
      });
      
      assert.strictEqual(dateText, 'Sin cita', `Expected appointment date to be cleared and show 'Sin cita', got: '${dateText}'`);
    }
  },
  {
    id: "TC-MOD-12",
    tier: "Tier 3",
    feature: "Admin Split Modal",
    title: "Blank Mandatory Fields Block",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      // Click edit
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Editar'));
        if (btn) btn.click();
      });
      
      await page.waitForSelector('input[type="text"]', { timeout: 2000 });
      
      // Clear Name input (first input element)
      await page.evaluate(() => {
        const nameInput = document.querySelector('input[type="text"]');
        nameInput.value = '';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
      
      // Click Guardar
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Guardar');
        if (btn) btn.click();
      });
      
      await new Promise(r => setTimeout(r, 1000));
      
      // Verify edit inputs are still visible (meaning it blocked validation/save and remained in edit mode)
      const inputsVisible = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
        return inputs.length > 0;
      });
      
      assert(inputsVisible, "Expected save to fail and keep edit mode inputs open due to blank name input field validation");
    }
  },
  {
    id: "TC-MOD-13",
    tier: "Tier 4",
    feature: "Admin Split Modal",
    title: "Status Value Tampering",
    run: async (page) => {
      resetDb();
      await goToAdminToolsAndOpenModal(page);
      
      // Inject HACKED status select option and change
      await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('.md\\:col-span-2 select'));
        const contratoSelect = selects[2];
        if (!contratoSelect) throw new Error("Contrato select not found");
        
        // Append invalid option
        const opt = document.createElement('option');
        opt.value = 'HACKED';
        opt.text = 'Hacked Status';
        contratoSelect.appendChild(opt);
        contratoSelect.value = 'HACKED';
        contratoSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      await new Promise(r => setTimeout(r, 1500));
      
      // Verify that database step status did NOT update to HACKED.
      // We will check by fetching it from db
      const dbStatus = await executeDbQuery(async (prisma) => {
        const progress = await prisma.userProcessProgress.findFirst({
          where: {
            user: { email: 'alejandro.gomez@gmail.com' },
            step: { name: { contains: 'Contrato de Adhesión' } }
          }
        });
        return progress ? progress.status : '';
      });
      
      assert.notStrictEqual(dbStatus, 'HACKED', "Adversarial Status Tampering succeeded! 'HACKED' was saved to the database!");
    }
  }
];
