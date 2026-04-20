const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/'vetements'/g, "'vetements_homme'");
fs.writeFileSync('src/App.tsx', code);
console.log("Done");
