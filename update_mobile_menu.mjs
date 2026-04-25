import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexModal = /<AnimatePresence>\s*\{isNewProductModalOpen && \(/m;

const mobileMenu = `<AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-theme-bg z-50 shadow-2xl flex flex-col border-r border-theme-border md:hidden"
            >
              <div className="p-[20px] bg-theme-bg border-b border-theme-border flex justify-between items-center shrink-0">
                <span className="font-serif text-[18px] font-bold text-theme-text tracking-tight">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="hover:text-theme-primary bg-white p-1.5 rounded-full shadow-sm ring-1 ring-theme-border"><X size={16} /></button>
              </div>

              <div className="flex-grow overflow-y-auto p-[20px] flex flex-col gap-[16px]">
                <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className={\`w-full text-left font-bold text-[16px] py-[10px] border-b border-theme-border/50 \${view === 'home' ? 'text-theme-primary' : 'text-theme-text'}\`}>Accueil</button>
                <button onClick={() => { setView('products'); setIsMobileMenuOpen(false); }} className={\`w-full text-left font-bold text-[16px] py-[10px] border-b border-theme-border/50 \${view === 'products' ? 'text-theme-primary' : 'text-theme-text'}\`}>Produits</button>
                
                <div className="mt-[10px]">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-theme-muted mb-[10px]">Catégories</h3>
                  <ul className="flex flex-col gap-[4px]">
                    {CATEGORIES_LIST.map(c => (
                      <li key={\`mobile-cat-\${c.id}\`}>
                        <button onClick={() => { setCategory(c.id as Category); setView('products'); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center justify-between py-[8px] text-[14px]">
                          <span className={\`\${category === c.id && view === 'products' ? 'text-theme-primary font-bold' : 'text-theme-text font-medium'}\`}>{c.fr}</span>
                          <span className="text-[11px] text-theme-muted">{c.ar}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewProductModalOpen && (`;

content = content.replace(regexModal, mobileMenu);

fs.writeFileSync('src/App.tsx', content);
console.log('Mobile menu integrated.');
