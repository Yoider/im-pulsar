const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\DEV\\AuthSndr\\ImpulsarPage\\expedientes de arraigo';
const tempDir = 'd:\\DEV\\AuthSndr\\ImpulsarPage\\scratch\\extracted';

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

function extractDocxText(docxPath) {
  const basename = path.basename(docxPath, '.docx');
  const zipPath = path.join(tempDir, `${basename}.zip`);
  const outPath = path.join(tempDir, basename);
  
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  if (fs.existsSync(outPath)) fs.rmSync(outPath, { recursive: true, force: true });
  
  fs.copyFileSync(docxPath, zipPath);
  
  try {
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outPath}' -Force"`);
    const docXmlPath = path.join(outPath, 'word', 'document.xml');
    if (fs.existsSync(docXmlPath)) {
      const xml = fs.readFileSync(docXmlPath, 'utf8');
      const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      const text = matches.map(m => m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '')).join(' ');
      return text;
    }
  } catch (err) {
    // ignore
  } finally {
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  }
  return '';
}

const folders = fs.readdirSync(rootDir);
const summary = [];

for (const folder of folders) {
  const folderPath = path.join(rootDir, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;
  
  const files = fs.readdirSync(folderPath);
  const docxFile = files.find(f => f.endsWith('.docx'));
  let docxText = '';
  if (docxFile) {
    docxText = extractDocxText(path.join(folderPath, docxFile));
  }
  
  summary.push({
    folderName: folder,
    files: files.filter(f => !f.endsWith('.docx')),
    docxName: docxFile || null,
    text: docxText
  });
}

fs.writeFileSync('scratch/all_clients_raw.json', JSON.stringify(summary, null, 2));
console.log(`Saved raw data for ${summary.length} folders.`);
