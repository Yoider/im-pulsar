const fs = require('fs');
const path = require('path');

const paths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

console.log('Checking browser paths:');
paths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`FOUND: ${p}`);
  } else {
    console.log(`NOT FOUND: ${p}`);
  }
});
