const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/nameFr:\s*'([^']+)'(.*?)image:\s*'[^']+'/g, (match, nameFr, mid) => {
  const enc = encodeURIComponent(nameFr).replace(/'/g, '%27');
  return `nameFr: '${nameFr}'${mid}image: 'https://placehold.co/400x300/e2e8f0/334155?text=${enc}'`;
});

fs.writeFileSync('src/App.tsx', code);
console.log("Images updated using node script");
