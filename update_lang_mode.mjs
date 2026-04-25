import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Moon, Sun, Globe to imports
content = content.replace(
  "LayoutDashboard, ShoppingBag, Layers, ArrowRight, ChevronDown, Banknote, PhoneCall",
  "LayoutDashboard, ShoppingBag, Layers, ArrowRight, ChevronDown, Banknote, PhoneCall, Moon, Sun, Globe"
);

// 2. Add state for language and dark mode
const stateBlockRegex = /const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);/;
const stateBlockReplacement = `const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const t = {
    home: { fr: "Accueil", ar: "الرئيسية" },
    products: { fr: "Produits", ar: "المنتجات" },
    categories: { fr: "Catégories", ar: "التصنيفات" },
    cart: { fr: "Mon Panier", ar: "سلة المشتريات" },
    checkout: { fr: "Commander", ar: "إتمام الطلب" },
    search: { fr: "Recherche...", ar: "بحث..." },
  };
`;
content = content.replace(stateBlockRegex, stateBlockReplacement);


// 3. Add buttons to header actions
const headerActionsRegex = /<button onClick=\{\(\) => setIsCartOpen\(true\)\} className="relative p-\[10px\] bg-white border border-theme-border rounded-full hover:bg-theme-bg transition-colors shadow-sm">/;
const headerActionsReplacement = `<button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} className="p-[10px] bg-white border border-theme-border rounded-full hover:bg-theme-bg transition-colors shadow-sm flex items-center gap-1 font-bold text-[12px]">
              <Globe size={18} className="text-theme-text" /> 
              <span className="hidden md:inline">{lang === 'fr' ? 'AR' : 'FR'}</span>
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-[10px] bg-white border border-theme-border rounded-full hover:bg-theme-bg transition-colors shadow-sm">
              {isDarkMode ? <Sun size={20} className="text-theme-text" /> : <Moon size={20} className="text-theme-text" />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-[10px] bg-white border border-theme-border rounded-full hover:bg-theme-bg transition-colors shadow-sm">`;
content = content.replace(headerActionsRegex, headerActionsReplacement);

// 4. Update Header Nav links
content = content.replace(/Accueil<\/button>/g, `{t.home[lang]}</button>`);
content = content.replace(/Produits<\/button>/g, `{t.products[lang]}</button>`);
content = content.replace(/Catégories <ChevronDown size=\{14\} \/>/g, `{t.categories[lang]} <ChevronDown size={14} />`);

// 5. Update main dir direction
content = content.replace(/dir="ltr"/, `dir={lang === 'ar' ? 'rtl' : 'ltr'} className={isDarkMode ? 'dark' : ''}`);

fs.writeFileSync('src/App.tsx', content);
console.log('Mode and language added');
