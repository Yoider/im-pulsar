const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\DEV\\AuthSndr\\ImpulsarPage\\expedientes de arraigo';
const tempDir = 'd:\\DEV\\AuthSndr\\ImpulsarPage\\scratch\\extracted';

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Find all docx files
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.docx')) {
      files.push(name);
    }
  }
  return files;
}

const docxFiles = getFiles(rootDir);
console.log(`Found ${docxFiles.length} docx files.`);

function extractDocxText(docxPath) {
  const basename = path.basename(docxPath, '.docx');
  const zipPath = path.join(tempDir, `${basename}.zip`);
  const outPath = path.join(tempDir, basename);
  
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  if (fs.existsSync(outPath)) fs.rmSync(outPath, { recursive: true, force: true });
  
  // Copy docx to zip
  fs.copyFileSync(docxPath, zipPath);
  
  try {
    // Expand zip using powershell
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outPath}' -Force"`);
    
    // Read word/document.xml
    const docXmlPath = path.join(outPath, 'word', 'document.xml');
    if (fs.existsSync(docXmlPath)) {
      const xml = fs.readFileSync(docXmlPath, 'utf8');
      // Simple regex to extract text between <w:t> tags
      const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      const text = matches.map(m => m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '')).join(' ');
      return text;
    }
  } catch (err) {
    console.error(`Error unzipping ${docxPath}:`, err.message);
  } finally {
    // Cleanup zip
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  }
  return '';
}

for (const file of docxFiles) {
  console.log(`\n=== FILE: ${file} ===`);
  const text = extractDocxText(file);
  console.log(text);
}
