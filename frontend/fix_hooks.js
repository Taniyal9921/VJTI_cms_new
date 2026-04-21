const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find top level useTranslation
  const match = content.match(/const\s+\{\s*t\s*\}\s*=\s*useTranslation\(\);\r?\n+/);
  if (match) {
     const fnMatch = content.match(/(export\s+(default\s+)?function\s+\w+\s*\([^)]*\)\s*\{)/);
     if (fnMatch) {
        // remove top level
        content = content.replace(match[0], '');
        // insert inside function
        content = content.replace(fnMatch[1], fnMatch[1] + '\n  const { t } = useTranslation();');
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${file}`);
     } else {
        console.log(`Could not find function in ${file}`);
     }
  } else {
     console.log(`No top level hook found or already fixed in ${file}`);
  }
}
