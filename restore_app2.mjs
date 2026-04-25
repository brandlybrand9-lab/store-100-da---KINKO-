import fs from 'fs';

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const cartDrawerStartIdx = appTsx.indexOf('const CartDrawer =');
const topPart = appTsx.substring(0, cartDrawerStartIdx);

let bottomPart = fs.readFileSync('bottom_code.tsx', 'utf8');

fs.writeFileSync('src/App.tsx', topPart + bottomPart);
console.log('Restored App.tsx');
