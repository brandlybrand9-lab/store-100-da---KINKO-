const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cart, 
  onRemove, 
  onCheckout 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cart: CartItem[], 
  onRemove: (id: string) => void,
  onCheckout: () => void
}) => {
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[360px] bg-theme-bg z-50 shadow-2xl flex flex-col sm:rounded-l-[24px] border-l border-theme-border"
          >
            <div className="p-[24px] bg-theme-bg border-b border-theme-border flex justify-between items-center sm:rounded-tl-[24px] shrink-0">
              <span className="text-[18px] font-bold text-theme-text tracking-tight">Mon Panier</span>
              <span className="text-theme-muted flex items-center gap-2">
                <span className="text-[14px] font-medium bg-theme-border/50 px-2 py-0.5 rounded-full">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                <button onClick={onClose} className="hover:text-theme-primary bg-white p-1.5 rounded-full shadow-sm ring-1 ring-theme-border"><X size={16} /></button>
              </span>
            </div>

            <div className="flex-grow overflow-y-auto p-[20px] flex flex-col gap-[16px]">
              {cart.length === 0 ? (
                <div className="text-center text-theme-muted mt-12 flex flex-col items-center">
                  <div className="w-20 h-20 bg-theme-border/30 rounded-full flex items-center justify-center mb-4">
                    <Package size={32} className="opacity-50" />
                  </div>
                  <p className="font-medium text-[15px]">Votre panier est vide</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.product.id}-${idx}`} className="flex gap-[16px] bg-white p-[12px] rounded-[16px] border border-theme-border shadow-sm items-center relative group">
                    <img src={item.product.image} className="w-[60px] h-[60px] object-contain bg-gray-50 rounded-[8px] p-1 border border-theme-border/50" referrerPolicy="no-referrer" />
                    <div className="flex-grow flex flex-col pt-1">
                      <span className="font-bold text-[14px] text-theme-text leading-tight line-clamp-1">{item.product.nameFr}</span>
                      <span className="text-theme-primary font-bold mt-1 text-[13px]">{item.product.price} DA x {item.quantity}</span>
                    </div>
                    <button onClick={() => onRemove(item.product.id)} className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-[20px] bg-white border-t border-theme-border sm:rounded-bl-[24px] shrink-0">
                <div className="flex justify-between items-center mb-[16px]">
                  <span className="text-[14px] font-bold text-theme-muted uppercase tracking-wider">Total</span>
                  <span className="text-[24px] font-extrabold text-theme-text tracking-tight">{total} DA</span>
                </div>
                <button onClick={onCheckout} className="w-full bg-theme-text text-theme-secondary font-bold py-[16px] rounded-[12px] hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 text-[15px]">
                  Commander <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'products' | 'checkout' | 'success' | 'admin'>('home');
  const [category, setCategory] = useState<Category>('diver' as Category);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Checkout states
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', city: 'cherchell', address: '' });
  
  // Admin states
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: 'divers' });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [adminTab, setAdminTab] = useState<'dashboard' | 'commandes' | 'produits' | 'collections'>('dashboard');

  const navigateTo = (newView: typeof view) => { window.scrollTo({ top: 0, behavior: 'smooth' }); setView(newView); };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.product.id !== id));

  // Firebase auth & fetch products...
  // I will just stub them for now to get the UI back, then implement them back.

  const processImage = async (file: File): Promise<string> => {
     return URL.createObjectURL(file); // mockup for now
  }

  const handleImageUpload = async (file: File, p: Product) => {}
  const generateMetadataForProduct = async (name: string) => {}
  const handleNewProductSubmit = async (e: React.FormEvent) => { e.preventDefault(); }

  const totalCart = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = 200;

  return (
    <div className="min-h-screen bg-theme-bg font-sans flex flex-col text-theme-text" dir="ltr">
      <header className="sticky top-0 z-40 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border h-[80px] shrink-0">
        <div className="max-w-[1200px] mx-auto w-full h-full px-[20px] md:px-[30px] flex items-center justify-between">
          
          <div className="flex items-center gap-[20px] md:gap-[30px] h-full">
            <button className="md:hidden p-2 -ml-2 text-theme-text" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-[12px] cursor-pointer group" onClick={() => navigateTo('home')}>
              <div className="w-[45px] h-[45px] bg-theme-primary rounded-[12px] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Store size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[20px] font-bold tracking-tight leading-none">Cherchell</span>
                <span className="text-[12px] text-theme-muted font-bold tracking-[0.2em] uppercase mt-1">Shopping</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-[24px] ml-[20px]">
              <button onClick={() => navigateTo('home')} className={`text-[14px] font-bold transition-colors ${view === 'home' ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-text'}`}>Accueil</button>
              <button onClick={() => navigateTo('products')} className={`text-[14px] font-bold transition-colors ${view === 'products' ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-text'}`}>Produits</button>
            </nav>
          </div>

          <div className="flex items-center gap-[16px]">
            <button onClick={() => setIsCartOpen(true)} className="relative p-[10px] bg-white border border-theme-border rounded-full hover:bg-theme-bg transition-colors shadow-sm">
              <ShoppingCart size={20} className="text-theme-text" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-[11px] font-bold w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-sm">{cart.reduce((s,i)=>s+i.quantity,0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1200px] mx-auto p-[20px] md:p-[30px] flex flex-col md:flex-row gap-[30px] items-start">
        {/* SIDEBAR FOR LAYOUT MATCH (Categories) */}
        {(view === 'home' || view === 'products') && (
          <aside className="w-full md:w-[260px] shrink-0 bg-white rounded-[16px] p-[24px] flex flex-col gap-[25px] shadow-sm border border-theme-border sticky top-[100px]">
            <div>
              <h3 className="text-[11px] uppercase tracking-[1.5px] text-theme-muted mb-[16px] font-bold">Catégories</h3>
              <ul className="list-none flex md:flex-col gap-[8px] overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                {CATEGORIES_LIST.map(cat => (
                  <li key={cat.id} className="min-w-[140px] md:min-w-0">
                    <button 
                      onClick={() => { setCategory(cat.id as Category); navigateTo('products'); }}
                      className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] cursor-pointer text-[14px] text-left transition-all ${category === cat.id && view === 'products' ? 'bg-theme-text text-theme-secondary font-medium' : 'text-theme-text hover:bg-theme-bg hover:text-theme-primary'}`}
                    >
                      <span className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 ${category === cat.id && view === 'products' ? 'bg-white/20 text-white' : 'bg-theme-bg border border-theme-border text-theme-muted'}`}>
                        <cat.icon size={16} />
                      </span>
                      <div className="leading-tight">
                        <strong className={`block ${category === cat.id && view === 'products' ? 'font-bold' : 'font-bold'}`}>{cat.fr}</strong>
                        <small className={`text-[11px] ${category === cat.id && view === 'products' ? 'text-white/70' : 'text-theme-muted'}`}>{cat.ar}</small>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        <div className="flex-grow w-full flex flex-col gap-[30px] overflow-hidden">
          
          {/* HOME COMPONENT */}
          {view === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-[30px]">
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
              
              <div className="flex justify-between items-end mb-[10px]">
                <div>
                  <h2 className="text-[24px] font-serif font-bold text-theme-text">Nos Produits</h2>
                  <p className="text-theme-muted text-[14px] mt-1">Découvrez notre sélection quotidienne</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[15px]">
                {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
              </div>
            </motion.div>
          )}

          {/* PRODUCTS COMPONENT */}
          {view === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-[30px]">
              <div className="flex justify-between items-end mb-[10px] pb-[15px] border-b border-theme-border">
                <div>
                  <h2 className="text-[28px] font-serif font-bold text-theme-text tracking-tight capitalize">{CATEGORIES_LIST.find(c => c.id === category)?.fr}</h2>
                  <p className="text-theme-muted text-[14px] mt-1">{CATEGORIES_LIST.find(c => c.id === category)?.ar}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[15px]">
                {products.filter(p => p.category === category).map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
                {products.filter(p => p.category === category).length === 0 && (
                  <div className="col-span-full py-[60px] text-center bg-white border border-theme-border rounded-[16px]">
                    <Package size={48} className="mx-auto text-theme-muted mb-[16px] opacity-20" />
                    <p className="text-theme-muted font-bold text-[16px]">Aucun produit dans cette catégorie.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* CHECKOUT COMPONENT */}
          {view === 'checkout' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <div className="flex items-center gap-[10px] text-theme-muted text-[13px] mb-[30px] font-bold">
                <button onClick={() => navigateTo('products')} className="hover:text-theme-text transition-colors">Boutique</button>
                <ChevronRight size={14} />
                <span className="text-theme-text">Paiement & Livraison</span>
              </div>

              <div className="flex flex-col lg:flex-row gap-[40px]">
                <form className="flex-grow flex flex-col gap-[30px]" onSubmit={(e) => { e.preventDefault(); navigateTo('success'); }}>
                  
                  <div className="bg-white border border-theme-border rounded-[24px] p-[30px] shadow-sm">
                    <h2 className="text-[20px] font-bold text-theme-text mb-[24px] tracking-tight">Informations de livraison</h2>
                    <div className="flex flex-col gap-[20px]">
                      <div>
                        <label className="block text-[13px] font-bold text-theme-muted mb-[8px] uppercase tracking-wider">Nom et Prénom *</label>
                        <input required className="w-full border border-theme-border rounded-[12px] p-[16px] bg-theme-bg focus:bg-white focus:border-theme-primary outline-none transition-all text-[15px] shadow-inner" placeholder="Votre nom complet" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-theme-muted mb-[8px] uppercase tracking-wider">Téléphone *</label>
                        <input required type="tel" className="w-full border border-theme-border rounded-[12px] p-[16px] bg-theme-bg focus:bg-white focus:border-theme-primary outline-none transition-all text-[15px] shadow-inner" placeholder="Votre numéro de téléphone" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-theme-muted mb-[8px] uppercase tracking-wider">Ville / Commune *</label>
                        <div className="relative">
                          <select required className="w-full appearance-none border border-theme-border rounded-[12px] p-[16px] pr-[40px] bg-theme-bg focus:bg-white focus:border-theme-primary outline-none transition-all text-[15px] shadow-inner" value={checkoutForm.city} onChange={e => setCheckoutForm({...checkoutForm, city: e.target.value})}>
                            <option value="cherchell">Cherchell / شرشال</option>
                            <option value="sidi_ghiles">Sidi Ghiles / سيدي غيلاس</option>
                            <option value="autres">Autres / أخرى (Livraison non garantie)</option>
                          </select>
                          <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-theme-muted pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-theme-muted mb-[8px] uppercase tracking-wider">Adresse complète *</label>
                        <textarea required rows={3} className="w-full border border-theme-border rounded-[12px] p-[16px] bg-theme-bg focus:bg-white focus:border-theme-primary outline-none transition-all text-[15px] shadow-inner resize-none" placeholder="Nom de rue, quartier, point de repère..." value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-theme-border rounded-[24px] p-[30px] shadow-sm">
                    <h2 className="text-[20px] font-bold text-theme-text mb-[24px] tracking-tight">Paiement</h2>
                    <div className="bg-green-50 border border-green-200 p-[20px] rounded-[16px] flex items-start gap-[16px]">
                      <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1"><CheckCircle size={20} /></div>
                      <div>
                        <h4 className="font-bold text-green-800 text-[15px] mb-[4px]">Paiement à la livraison</h4>
                        <p className="text-green-700 text-[14px]">Vous paierez le montant total en espèces au livreur lors de la réception de votre commande.</p>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-theme-primary text-white font-black py-[20px] rounded-[16px] text-[18px] shadow-lg hover:-translate-y-1 transition-all hover:shadow-xl mt-[10px]">
                    CONFIRMER LA COMMANDE ({totalCart + deliveryFee} DA)
                  </button>

                </form>

                <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-[30px]">
                  <div className="bg-white border border-theme-border rounded-[24px] p-[30px] shadow-sm sticky top-[100px]">
                    <h2 className="text-[20px] font-bold text-theme-text mb-[24px] tracking-tight border-b border-theme-border pb-[16px]">Résumé de la commande</h2>
                    
                    <div className="flex flex-col gap-[16px] mb-[24px] max-h-[300px] overflow-y-auto pr-2">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-[16px] items-center">
                          <img src={item.product.image} className="w-[50px] h-[50px] object-contain bg-theme-bg rounded-[8px] p-1 border border-theme-border/50" />
                          <div className="flex-grow">
                            <div className="font-bold text-[13px] leading-tight line-clamp-1">{item.product.nameFr}</div>
                            <div className="text-theme-muted text-[12px] mt-0.5">Qté: {item.quantity}</div>
                          </div>
                          <div className="font-bold text-[14px]">{item.product.price * item.quantity} DA</div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-theme-border pt-[20px] flex flex-col gap-[12px]">
                      <div className="flex justify-between items-center text-[14px] text-theme-muted">
                        <span>Sous-total sous réserve</span>
                        <span className="font-bold text-theme-text">{totalCart} DA</span>
                      </div>
                      <div className="flex justify-between items-center text-[14px] text-theme-muted">
                        <span>Frais de livraison (Fixe)</span>
                        <span className="font-bold text-theme-text">{deliveryFee} DA</span>
                      </div>
                      <div className="border-t border-dashed border-theme-border mt-[8px] pt-[16px] flex justify-between items-end">
                        <span className="text-[16px] font-bold text-theme-text">Total</span>
                        <span className="text-[28px] font-extrabold text-theme-text leading-none">{totalCart + deliveryFee} DA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS COMPONENT */}
          {view === 'success' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-[80px] text-center max-w-lg mx-auto">
              <div className="w-[100px] h-[100px] bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-[30px] shadow-inner border border-green-200">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-[32px] font-serif font-black text-theme-text mb-[16px] tracking-tight">Commande <span className="text-theme-primary">Confirmée</span> !</h2>
              <p className="text-theme-muted text-[16px] mb-[40px] leading-relaxed">
                Votre commande a été enregistrée avec succès. Notre livreur vous contactera très prochainement pour convenir de la livraison.
              </p>
              <div className="flex justify-center w-full">
                <button onClick={() => { setCart([]); navigateTo('home'); }} className="bg-theme-text text-theme-secondary font-bold px-[40px] py-[16px] rounded-[16px] hover:bg-black transition-colors shadow-lg w-full sm:w-auto">
                  Retour à la boutique
                </button>
              </div>
            </motion.div>
          )}

          {/* ADMIN COMPONENT */}
          {view === 'admin' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                {!user ? (
                  <div className="flex flex-col items-center justify-center py-20 max-w-sm mx-auto w-full">
                    <div className="bg-white border rounded-[24px] p-[40px] shadow-sm w-full">
                      <div className="w-[60px] h-[60px] bg-theme-primary/10 text-theme-primary rounded-[16px] flex items-center justify-center mx-auto mb-[24px]">
                        <LockIcon size={32} />
                      </div>
                      <h2 className="text-[24px] font-bold text-center mb-[30px]">Accès Admin</h2>
                      <p className="text-sm text-theme-muted mb-6 text-center">Vous devez être l'administrateur certifié.</p>
                      
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={async () => { try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch(e) { alert('Erreur Google Auth'); } }} 
                          className="w-full bg-white border border-gray-300 text-gray-700 py-[12px] rounded-[12px] font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path fill="none" d="M1 1h22v22H1z" /></svg>
                          Google Login
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-full min-h-[600px] bg-theme-bg -m-[20px] md:-m-[30px] p-[20px] md:p-[40px] rounded-[16px] md:rounded-[24px]">
                    <div className="flex justify-between items-start border-b border-theme-border pb-[24px] mb-[30px]">
                      <div>
                        <h2 className="text-[28px] font-serif font-bold text-theme-text tracking-tight mb-[4px]">Espace Administrateur</h2>
                        <p className="text-[14px] text-theme-muted">Gérez votre boutique en toute simplicité</p>
                      </div>
                      <button 
                        onClick={() => navigateTo('home')} 
                        className="bg-white border border-theme-border text-theme-text text-[13px] font-medium px-[16px] py-[8px] rounded-full shadow-sm hover:bg-theme-bg transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-[40px]">
                      {/* Admin Navigation */}
                      <div className="w-full md:w-[220px] flex flex-col shrink-0">
                        <div className="flex flex-col gap-[6px] border-b border-theme-border pb-[20px] mb-[20px]">
                          <button 
                            onClick={() => setAdminTab('dashboard')} 
                            className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[10px] text-[14px] font-bold transition-all ${adminTab === 'dashboard' ? 'bg-theme-text text-theme-secondary shadow-md' : 'text-theme-muted hover:text-theme-text hover:bg-white border border-transparent hover:border-theme-border'}`}
                          >
                            <LayoutDashboard size={18} /> Dashboard
                          </button>
                          <button 
                            onClick={() => setAdminTab('commandes')} 
                            className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[10px] text-[14px] font-bold transition-all ${adminTab === 'commandes' ? 'bg-theme-text text-theme-secondary shadow-md' : 'text-theme-muted hover:text-theme-text hover:bg-white border border-transparent hover:border-theme-border'}`}
                          >
                            <ShoppingBag size={18} /> Commandes
                          </button>
                        </div>
                        <div className="flex flex-col gap-[6px]">
                          <button 
                            onClick={() => setAdminTab('produits')} 
                            className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[10px] text-[14px] font-bold transition-all ${adminTab === 'produits' ? 'bg-theme-text text-theme-secondary shadow-md' : 'text-theme-muted hover:text-theme-text hover:bg-white border border-transparent hover:border-theme-border'}`}
                          >
                            <Package size={18} /> Produits
                          </button>
                          <button 
                            onClick={() => setAdminTab('collections')} 
                            className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[10px] text-[14px] font-bold transition-all ${adminTab === 'collections' ? 'bg-theme-text text-theme-secondary shadow-md' : 'text-theme-muted hover:text-theme-text hover:bg-white border border-transparent hover:border-theme-border'}`}
                          >
                            <Layers size={18} /> Collections
                          </button>
                        </div>

                        <div className="mt-[40px] md:mt-auto">
                          <button 
                            onClick={() => signOut(auth)} 
                            className="flex items-center gap-[12px] px-[16px] py-[10px] text-[14px] font-bold text-theme-muted hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-colors w-full text-left"
                          >
                            <LogOut size={18} /> Déconnexion
                          </button>
                        </div>
                      </div>

                      {/* Admin Content Area */}
                      <div className="flex-grow w-full">
                        {adminTab === 'dashboard' && (
                          <div className="flex flex-col gap-[25px]">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[25px]">
                              <div className="bg-white border border-theme-border rounded-[16px] p-[24px] relative overflow-hidden shadow-sm">
                                <div className="text-[11px] font-bold text-theme-muted mb-[15px] tracking-[1.5px] uppercase">Total commandes</div>
                                <div className="text-[36px] font-serif font-normal leading-none tracking-tight">0</div>
                                <ShoppingBag className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-border opacity-50" size={80} strokeWidth={1} />
                              </div>
                              <div className="bg-white border border-theme-border rounded-[16px] p-[24px] relative overflow-hidden shadow-sm">
                                <div className="text-[11px] font-bold text-theme-muted mb-[15px] tracking-[1.5px] uppercase">Chiffre d'affaires</div>
                                <div className="text-[36px] font-serif font-normal text-[#e67e22] leading-none tracking-tight">0 <span className="text-[20px] font-sans font-bold">DA</span></div>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-border text-[80px] font-light leading-none opacity-50">$</span>
                              </div>
                              <div className="bg-white border border-theme-border rounded-[16px] p-[24px] relative overflow-hidden shadow-sm">
                                <div className="text-[11px] font-bold text-theme-muted mb-[15px] tracking-[1.5px] uppercase">En attente d'expédition</div>
                                <div className="text-[36px] font-serif font-normal leading-none tracking-tight">0</div>
                                <Activity className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-border opacity-50" size={80} strokeWidth={1} />
                              </div>
                            </div>
                            
                            <div className="bg-white border border-theme-border rounded-[16px] p-[30px] min-h-[400px] shadow-sm flex flex-col">
                               <div className="flex items-center gap-[8px] text-[14px] font-bold text-theme-text mb-[40px]">
                                 <Activity size={18} className="text-[#e67e22]" /> Évolution des ventes (DA)
                               </div>
                               <div className="flex-grow relative flex flex-col justify-between py-[20px]">
                                 <div className="border-t border-dashed border-theme-border"></div>
                                 <div className="border-t border-dashed border-theme-border"></div>
                                 <div className="border-t border-dashed border-theme-border"></div>
                               </div>
                            </div>
                          </div>
                        )}

                        {adminTab === 'produits' && (
                          <div className="flex flex-col gap-[20px]">
                            <div className="flex flex-wrap gap-[15px] justify-between items-center mb-2">
                              <h3 className="font-bold text-[20px] font-serif">Produits</h3>
                              <div className="flex gap-2">
                                <button onClick={() => setIsNewProductModalOpen(true)} className="bg-theme-text text-theme-secondary font-bold px-[20px] py-[10px] rounded-[10px] flex items-center gap-[8px] text-[13px] hover:bg-opacity-90 transition-opacity shadow-md">
                                  <Plus size={16} /> Nouveau Produit
                                </button>
                              </div>
                            </div>

                            <div className="border border-theme-border rounded-[16px] bg-white overflow-hidden shadow-sm">
                              <table className="w-full text-left text-[13px]">
                                <thead className="bg-[#f8f9fa] border-b border-theme-border">
                                  <tr>
                                    <th className="p-[15px] font-bold text-theme-muted">Image</th>
                                    <th className="p-[15px] font-bold text-theme-muted">Produit (ID)</th>
                                    <th className="p-[15px] font-bold text-theme-muted">Prix</th>
                                    <th className="p-[15px] font-bold text-theme-muted text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {products.map(p => (
                                    <tr key={p.id} className="border-b border-theme-border last:border-0 hover:bg-theme-bg transition-colors">
                                      <td className="p-[15px]">
                                        <div className="w-[60px] h-[60px] bg-theme-bg rounded-[8px] overflow-hidden relative group border border-theme-border">
                                          <img src={p.image} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                                          <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                            <input 
                                              type="file" 
                                              accept="image/*" 
                                              className="hidden" 
                                              onChange={(e) => {
                                                if(e.target.files && e.target.files[0]) {
                                                   handleImageUpload(e.target.files[0], p);
                                                }
                                              }}
                                            />
                                            {isProcessingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                          </label>
                                        </div>
                                      </td>
                                      <td className="p-[15px]">
                                        <div className="font-bold text-[14px] text-theme-text mb-[4px]">{p.nameFr}</div>
                                        <div className="text-[12px] text-theme-muted font-mono">{p.id} - {p.category}</div>
                                      </td>
                                      <td className="p-[15px] font-bold text-theme-text">{p.price} DA</td>
                                      <td className="p-[15px] text-right">
                                        <button 
                                          className="text-theme-muted hover:text-red-600 bg-theme-bg hover:bg-red-50 p-[8px] rounded-[8px] transition-colors inline-flex border border-theme-border"
                                          onClick={async () => {
                                            if(confirm('Supprimer ce produit ?')) {
                                              try {
                                                await deleteDoc(doc(db, 'products', p.id));
                                                setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                              } catch(e) {
                                                alert('Erreur de suppression');
                                              }
                                            }
                                          }}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {products.length === 0 && (
                                <div className="p-[30px] text-center text-theme-muted font-medium">Aucun produit pour le moment.</div>
                              )}
                            </div>
                          </div>
                        )}

                        {(adminTab === 'commandes' || adminTab === 'collections') && (
                           <div className="flex flex-col items-center justify-center py-[80px] text-center bg-white border border-theme-border rounded-[16px] shadow-sm">
                             <Package size={56} className="text-theme-border mb-[20px]" strokeWidth={1} />
                             <h3 className="text-[20px] font-serif font-bold text-theme-text mb-[8px]">Bientôt disponible</h3>
                             <p className="text-[14px] text-theme-muted max-w-[300px]">Cette fonctionnalité sera disponible dans une prochaine mise à jour.</p>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </motion.div>
          )}

        </div>
      </main>

      <footer id="contact" className="h-[auto] md:h-[60px] bg-white border-t border-theme-border flex flex-col md:flex-row items-center justify-between px-[20px] md:px-[30px] text-[12px] text-theme-muted shrink-0 py-4 md:py-0 mt-auto">
        <div className="mb-2 md:mb-0 text-center md:text-left font-medium">© {new Date().getFullYear()} Cherchell Shopping 100 DA</div>
        <div className="flex gap-[10px] text-theme-primary font-bold mb-2 md:mb-0">
          <span>FR</span>
          <span>|</span>
          <span dir="rtl">العربية</span>
        </div>
        <div className="flex items-center gap-[10px] font-medium">
          <span>Contact: +213 555 00 00 00</span>
          <button onClick={() => navigateTo('admin')} className="text-theme-border hover:text-theme-primary ml-2 transition-colors">
            <LockIcon size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
}
