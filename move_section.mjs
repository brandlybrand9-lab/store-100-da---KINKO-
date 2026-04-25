import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const removeRegex = /\{\/\* DESCRIPTION SERVICE \(3 columns\) \*\/\}[\s\S]*?<\/div>\s*\{\/\* COMMENT CA SE PASSE LE SERVICE \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

if (removeRegex.test(content)) {
  const match = content.match(removeRegex)[0];
  content = content.replace(removeRegex, '');
  
  const endOfHomeRegex = /<button \s*onClick=\{\(\) => navigateTo\('products'\)\}\s*className="bg-white border-2 border-theme-border text-theme-text font-bold py-\[12px\] px-\[32px\] rounded-\[16px\] hover:bg-theme-bg transition-colors shadow-sm text-\[16px\] flex items-center gap-2"\s*>\s*Voir tous les produits <ArrowRight size=\{18\} \/>\s*<\/button>\s*<\/div>\s*<\!-- END OF HOME BUTTON -->/;
  
  // let's grab the actual string instead.
  const endButton = `<button 
                  onClick={() => navigateTo('products')}
                  className="bg-white border-2 border-theme-border text-theme-text font-bold py-[12px] px-[32px] rounded-[16px] hover:bg-theme-bg transition-colors shadow-sm text-[16px] flex items-center gap-2"
                >
                  Voir tous les produits <ArrowRight size={18} />
                </button>
              </div>

            </motion.div>`;
  
  if (content.includes(endButton)) {
     const targetReplace = endButton.replace('</motion.div>', '\\n' + match + '\\n            </motion.div>');
     content = content.replace(endButton, targetReplace);
     fs.writeFileSync('src/App.tsx', content);
     console.log('Successfully moved section!');
  } else {
     console.log('Could not find the end of home block');
  }
} else {
  console.log('Could not find the service block');
}
