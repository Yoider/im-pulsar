const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\yodie\\.gemini\\antigravity\\brain\\dacb47b7-a9b8-46ef-972e-81b866e48f82\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logPath)) {
  console.log("Transcript not found");
  process.exit(1);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
const matches = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' || data.source === 'USER_EXPLICIT') {
      const content = data.content || '';
      if (content.toLowerCase().includes('drive') || content.toLowerCase().includes('http') || content.toLowerCase().includes('excel') || content.toLowerCase().includes('spread')) {
        matches.push({
          step_index: data.step_index,
          content: content
        });
      }
    }
  } catch (err) {}
}

console.log(`Found ${matches.length} user inputs with keywords.`);
matches.forEach(m => {
  console.log(`\n=== STEP ${m.step_index} ===`);
  console.log(m.content);
});
