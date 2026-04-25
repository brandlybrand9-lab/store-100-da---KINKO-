import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexNav = /<nav className="hidden md:flex items-center gap-\[24px\] ml-\[20px\]">\s*<button onClick=\{\(\) => navigateTo\('home'\)\} className=\{`text-\[14px\] font-bold transition-colors \$\{view === 'home' \? 'text-theme-primary' : 'text-theme-muted hover:text-theme-text'\}`\}>Accueil<\/button>\s*<button onClick=\{\(\) => navigateTo\('products'\)\} className=\{`text-\[14px\] font-bold transition-colors \$\{view === 'products' \? 'text-theme-primary' : 'text-theme-muted hover:text-theme-text'\}`\}>Produits<\/button>\s*<\/nav>/m;

const newNav = `<nav className="hidden md:flex items-center gap-[24px] ml-[20px]">
              <button onClick={() => navigateTo('home')} className={\`text-[14px] font-bold transition-colors \${view === 'home' ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-text'}\`}>Accueil</button>
              <button onClick={() => navigateTo('products')} className={\`text-[14px] font-bold transition-colors \${view === 'products' ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-text'}\`}>Produits</button>
              <div className="relative group">
                <button 
                  className={\`text-[14px] font-bold transition-colors text-theme-muted hover:text-theme-text flex items-center gap-1\`}
                >
                  Catégories <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 mt-[10px] bg-white border border-theme-border rounded-[12px] shadow-lg py-[8px] w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {CATEGORIES_LIST.map(c => (
                     <button key={c.id} onClick={() => { setCategory(c.id as Category); navigateTo('products'); }} className="w-full text-left px-[16px] py-[8px] text-[13px] font-bold text-theme-text hover:bg-theme-bg flex items-center justify-between">
                       <span>{c.fr}</span>
                       <span className="text-[11px] text-theme-muted">{c.ar}</span>
                     </button>
                  ))}
                </div>
              </div>
            </nav>`;

content = content.replace(regexNav, newNav);

const regexMain = /<main className="flex-grow w-full max-w-\[1200px\] mx-auto p-\[20px\] md:p-\[30px\] flex flex-col md:flex-row gap-\[30px\] items-start">\s*\{\/\* SIDEBAR FOR LAYOUT MATCH \(Categories\) \*\/\}\s*\{\(view === 'home' \|\| view === 'products'\) && \(\s*<aside[\s\S]*?<\/aside>\s*\)\}\s*<div className="flex-grow w-full flex flex-col gap-\[30px\] overflow-hidden">/m;

const mainReplacement = `<main className="flex-grow w-full max-w-[1200px] mx-auto p-[20px] md:p-[30px] flex flex-col gap-[30px] items-start overflow-hidden">
        <div className="flex-grow w-full flex flex-col gap-[30px]">`;

content = content.replace(regexMain, mainReplacement);

const regexHome = /\{\/\* HOME COMPONENT \*\/\}\s*\{view === 'home' && \(\s*<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\} className="flex flex-col gap-\[30px\]">\s*<div className="relative bg-theme-text rounded-\[24px\] overflow-hidden shadow-lg border border-theme-border flex items-center min-h-\[300px\]">[\s\S]*?<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-\[15px\]">\s*\{products\.slice\(0, 8\)\.map\(p => <ProductCard key=\{p\.id\} product=\{p\} onAdd=\{addToCart\} \/>\)\}\s*<\/div>\s*<\/motion\.div>\s*\)\}/;

const newHome = `{/* HOME COMPONENT */}
          {view === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-[30px] md:gap-[40px]">
              
              {/* HERO BANNER */}
              <div className="relative bg-theme-text rounded-[24px] overflow-hidden shadow-lg border border-theme-border flex items-center min-h-[300px]">
                <div className="absolute inset-0 bg-black/40 z-10 block md:hidden"></div>
                <div className="relative z-20 flex-grow p-[30px] md:p-[60px] flex flex-col justify-center w-full md:w-3/5 text-center md:text-left">
                  <h1 className="text-[32px] md:text-[48px] font-serif font-black text-white leading-[1.1] tracking-tight drop-shadow-md">
                    Vos achats du quotidien,<br/>livrés chez vous à
                    <span className="text-[#f1c40f] block mt-2">Cherchell & Sidi Ghiles</span>
                  </h1>
                  <p className="mt-[20px] text-gray-200 text-[16px] md:text-[18px] max-w-xl mx-auto md:mx-0 font-medium">Boutique en ligne avec livraison à domicile pour vos achats réguliers.</p>
                  <button onClick={() => navigateTo('products')} className="mt-[30px] self-center md:self-start bg-theme-primary hover:bg-[#c0392b] text-white px-[30px] py-[15px] rounded-[12px] font-extrabold text-[16px] shadow-sm transition-all hover:shadow-md flex items-center gap-2 w-max">
                    Découvrir nos produits <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* DESCRIPTION SERVICE (3 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
                <div className="bg-white p-[24px] rounded-[20px] border border-theme-border shadow-sm flex flex-col items-center text-center">
                   <div className="w-[60px] h-[60px] bg-theme-bg rounded-full flex items-center justify-center text-theme-primary mb-[16px]">
                     <Package size={28} />
                   </div>
                   <h3 className="font-bold text-[18px] text-theme-text mb-[8px]">Large Choix de Produits</h3>
                   <p className="text-theme-muted text-[14px]">Trouvez facilement tous vos articles de maison, cuisine, cosmétiques, plastiques, et quincaillerie en un seul endroit.</p>
                </div>
                <div className="bg-white p-[24px] rounded-[20px] border border-theme-border shadow-sm flex flex-col items-center text-center">
                   <div className="w-[60px] h-[60px] bg-theme-bg rounded-full flex items-center justify-center text-theme-primary mb-[16px]">
                     <Truck size={28} />
                   </div>
                   <h3 className="font-bold text-[18px] text-theme-text mb-[8px]">Livraison Rapide</h3>
                   <p className="text-theme-muted text-[14px]">On vous livre vos achats directement à domicile dans les communes de Cherchell et Sidi Ghiles.</p>
                </div>
                <div className="bg-white p-[24px] rounded-[20px] border border-theme-border shadow-sm flex flex-col items-center text-center">
                   <div className="w-[60px] h-[60px] bg-theme-bg rounded-full flex items-center justify-center text-theme-primary mb-[16px]">
                     <Banknote size={28} />
                   </div>
                   <h3 className="font-bold text-[18px] text-theme-text mb-[8px]">Paiement à la Livraison</h3>
                   <p className="text-theme-muted text-[14px]">Payez vos achats en espèces lorsque notre livreur se présente devant votre porte, en toute sécurité.</p>
                </div>
              </div>

              {/* COMMENT CA SE PASSE LE SERVICE */}
              <div className="bg-theme-bg p-[40px] rounded-[24px] flex flex-col gap-[30px] border border-theme-border text-center relative overflow-hidden">
                 <h2 className="text-[24px] font-serif font-bold text-theme-text z-10 relative mt-4">Comment ça marche ?</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px] z-10 relative my-[20px]">
                    <div className="flex flex-col items-center gap-[12px]">
                       <div className="text-[32px] font-black text-theme-primary/20 leading-none">01</div>
                       <ShoppingCart size={32} className="text-theme-text mb-2" />
                       <h4 className="font-bold text-[16px]">Commandez en ligne</h4>
                       <p className="text-[14px] text-theme-muted">Ajoutez vos articles au panier et passez commande facilement.</p>
                    </div>
                    <div className="hidden md:block absolute top-[60%] left-[25%] w-[16%] h-[2px] border-t-2 border-dashed border-theme-text/20 -translate-y-1/2"></div>
                    <div className="flex flex-col items-center gap-[12px]">
                       <div className="text-[32px] font-black text-theme-primary/20 leading-none">02</div>
                       <PhoneCall size={32} className="text-theme-text mb-2" />
                       <h4 className="font-bold text-[16px]">Confirmation</h4>
                       <p className="text-[14px] text-theme-muted">Nous vous appelons pour confirmer la commande et l'heure de livraison.</p>
                    </div>
                    <div className="hidden md:block absolute top-[60%] right-[25%] w-[16%] h-[2px] border-t-2 border-dashed border-theme-text/20 -translate-y-1/2"></div>
                    <div className="flex flex-col items-center gap-[12px]">
                       <div className="text-[32px] font-black text-theme-primary/20 leading-none">03</div>
                       <Home size={32} className="text-theme-text mb-2" />
                       <h4 className="font-bold text-[16px]">Réception & Paiement</h4>
                       <p className="text-[14px] text-theme-muted">Recevez vos produits chez vous et payez le livreur.</p>
                    </div>
                 </div>
              </div>
              
              <div className="flex justify-between items-end mb-[10px]">
                <div>
                  <h2 className="text-[24px] font-serif font-bold text-theme-text">Certains de nos Produits</h2>
                  <p className="text-theme-muted text-[14px] mt-1">Découvrez notre collection</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[15px]">
                {products.slice(0, 12).map(p => <ProductCard key={\`home-\${p.id}\`} product={p} onAdd={addToCart} />)}
              </div>
              
              <div className="flex justify-center mt-[10px]">
                <button 
                  onClick={() => navigateTo('products')}
                  className="bg-white border-2 border-theme-border text-theme-text font-bold py-[12px] px-[32px] rounded-[16px] hover:bg-theme-bg transition-colors shadow-sm text-[16px] flex items-center gap-2"
                >
                  Voir tous les produits <ArrowRight size={18} />
                </button>
              </div>

            </motion.div>
          )}`;

content = content.replace(regexHome, newHome);

fs.writeFileSync('src/App.tsx', content);
console.log('Modifications written via script.');
