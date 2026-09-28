const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const replacements = [
  // Backgrounds
  { regex: /bg-\[#FAF7F2\]|bg-\[#FAF8F5\]|bg-stone-50/g, replacement: 'bg-base' },
  { regex: /bg-\[#FFFFFF\]|bg-white/g, replacement: 'bg-surface' },
  { regex: /bg-\[#F4EFE6\]|bg-\[#ECE5D8\]|bg-stone-100/g, replacement: 'bg-surface-subtle' },
  
  // Text
  { regex: /text-\[#241A17\]|text-\[#1C1917\]|text-stone-900|text-stone-800/g, replacement: 'text-text-primary' },
  { regex: /text-\[#6B5E59\]|text-\[#68635B\]|text-\[#8C8476\]|text-stone-600|text-stone-500/g, replacement: 'text-text-secondary' },
  { regex: /text-\[#968A84\]|text-stone-400/g, replacement: 'text-text-tertiary' },
  
  // Borders
  { regex: /border-\[#E9E2D5\]|border-\[#E7E3DA\]|border-stone-200/g, replacement: 'border-border-subtle' },
  { regex: /border-\[#D8CFBF\]|border-\[#D0C5B3\]|border-stone-300/g, replacement: 'border-border-hover' },
  
  // Accent (Maroon -> Accent)
  { regex: /bg-\[#7E1929\]|bg-\[#1C1917\]/g, replacement: 'bg-accent' },
  { regex: /text-\[#7E1929\]/g, replacement: 'text-accent' },
  { regex: /border-\[#7E1929\]/g, replacement: 'border-accent' },
  { regex: /bg-\[#63121F\]|bg-\[#2C2724\]/g, replacement: 'bg-accent-hover' },
  { regex: /bg-\[#7E1929\]\/15|bg-\[#7E1929\]\/10|bg-\[#7E1929\]\/5/g, replacement: 'bg-accent-subtle' },
  
  // Gold
  { regex: /text-\[#C59B27\]/g, replacement: 'text-gold' },
  { regex: /bg-\[#C59B27\]/g, replacement: 'bg-gold' },
  
  // Whatsapp
  { regex: /bg-\[#1E8349\]/g, replacement: 'bg-whatsapp' },
  { regex: /bg-\[#166B3B\]/g, replacement: 'bg-whatsapp-hover' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done replacing colors.');
