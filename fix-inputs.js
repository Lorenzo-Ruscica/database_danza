const fs = require('fs');
const path = require('path');
const glob = require('glob');

const dir = path.join(__dirname, 'src', 'components', 'kiosk', 'steps');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace <Input ...> with <Input inputMode="none" autoComplete="off" onContextMenu={(e) => e.preventDefault()} ...>
  // Note: we can't just blindly replace because of newlines and existing props, but we know it's generic form inputs.
  // Instead of complex regex, let's just replace `<Input ` with `<Input inputMode="none" autoComplete="off" onContextMenu={(e) => e.preventDefault()} `
  // avoiding duplicate replacements.
  if (!content.includes('inputMode="none"')) {
     content = content.replace(/<Input /g, '<Input inputMode="none" autoComplete="off" onContextMenu={(e) => e.preventDefault()} ');
     fs.writeFileSync(filePath, content);
     console.log(`Updated ${file}`);
  }
}
