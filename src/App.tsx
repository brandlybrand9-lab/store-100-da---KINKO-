import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Trash2, Package, Shirt, Gamepad2, CheckCircle, ChevronRight, MapPin, Truck, Phone, Home, Hammer, Sparkles, Tv, PenTool, Gift, Pencil, Loader2, Car, Settings, Baby, Briefcase, Music, TreePine, Dog, Key, Dumbbell, Book, Sofa, Store, Heart, Watch, Gem, Palette, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

// --- Types ---
type Category = 'plastique' | 'vetements_homme' | 'vetements_femme' | 'vetements_enfants' | 'jouets' | 'maison' | 'bricolage' | 'hygiene' | 'electronique' | 'papeterie' | 'packs' | 'vehicules' | 'pieces_auto' | 'bebes' | 'bagages' | 'musique' | 'jardin' | 'animaux' | 'locations' | 'sport' | 'livres' | 'meubles' | 'videgrenier' | 'sante' | 'bijoux' | 'antiquites' | 'art' | 'divers' | 'immobilier';

interface Product {
  id: string;
  nameFr: string;
  nameAr: string;
  category: Category;
  descriptionFr: string;
  descriptionAr: string;
  image: string;
  price: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

// --- Data ---
const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', category: 'plastique', price: 100, nameFr: 'Bassine en Plastique', nameAr: 'حوض بلاستيك', descriptionFr: 'Grande bassine pour lessive et ménage.', descriptionAr: 'حوض كبير للغسيل', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Bassine%20en%20Plastique' },
  { id: 'p2', category: 'plastique', price: 100, nameFr: 'Lot de 5 Cintres', nameAr: 'مجموعة 5 علاقات', descriptionFr: 'Cintres solides de rangement.', descriptionAr: 'علاقات ملابس متينة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Lot%20de%205%20Cintres' },
  { id: 'p3', category: 'plastique', price: 100, nameFr: 'Boîte de Rangement', nameAr: 'صندوق تخزين', descriptionFr: 'Idéale pour organiser vos objets.', descriptionAr: 'مثالي لتنظيم أشيائك', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Bo%C3%AEte%20de%20Rangement' },
  { id: 'p4', category: 'plastique', price: 100, nameFr: 'Egouttoir à Vaisselle', nameAr: 'مصفاة أطباق', descriptionFr: 'Égouttoir pratique pour cuisine.', descriptionAr: 'مصفاة عملية للمطبخ', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Egouttoir%20%C3%A0%20Vaisselle' },
  { id: 'p5', category: 'plastique', price: 50, nameFr: 'Verre en plastique', nameAr: 'كأس بلاستيك', descriptionFr: 'Verre incassable.', descriptionAr: 'كأس بلاستيكي', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Verre%20en%20plastique' },
  { id: 'v1', category: 'vetements_homme', price: 100, nameFr: 'T-shirt Basique', nameAr: 'تي شيرت أساسي', descriptionFr: 'T-shirt 100% coton, confortable.', descriptionAr: 'تي شيرت قطن 100٪', image: 'https://placehold.co/400x300/e2e8f0/334155?text=T-shirt%20Basique' },
  { id: 'v2', category: 'vetements_homme', price: 100, nameFr: 'Paire de Chaussettes', nameAr: 'زوج جوارب', descriptionFr: 'Chaussettes chaudes et douces.', descriptionAr: 'جوارب دافئة ومريحة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Paire%20de%20Chaussettes' },
  { id: 'v3', category: 'vetements_homme', price: 100, nameFr: 'Casquette Ajustable', nameAr: 'قبعة رياضية', descriptionFr: 'Parfaite pour l\'été.', descriptionAr: 'مثالية للصيف', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Casquette%20Ajustable' },
  { id: 'v4', category: 'vetements_homme', price: 100, nameFr: 'Bonnet d\'Hiver', nameAr: 'قبعة شتوية', descriptionFr: 'Bonnet tricoté en laine.', descriptionAr: 'قبعة منسوجة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Bonnet%20d%5C' },
  { id: 'j1', category: 'jouets', price: 100, nameFr: 'Petite Voiture Course', nameAr: 'سيارة سباق صغيرة', descriptionFr: 'Voiture en plastique.', descriptionAr: 'سيارة بلاستيكية', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Petite%20Voiture%20Course' },
  { id: 'j2', category: 'jouets', price: 100, nameFr: 'Balle Colorée', nameAr: 'كرة ملونة', descriptionFr: 'Balle en mousse rebondissante.', descriptionAr: 'كرة نطاطة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Balle%20Color%C3%A9e' },
  { id: 'j3', category: 'jouets', price: 100, nameFr: 'Corde à Sauter', nameAr: 'حبل قفز', descriptionFr: 'Corde avec poignées.', descriptionAr: 'حبل بمقابض', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Corde%20%C3%A0%20Sauter' },
  { id: 'j4', category: 'jouets', price: 100, nameFr: 'Mini Puzzle Animaux', nameAr: 'بازل حيوانات', descriptionFr: 'Puzzle éducatif pour enfants.', descriptionAr: 'لغز تعليمي', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Mini%20Puzzle%20Animaux' },
  { id: 'm1', category: 'maison', price: 100, nameFr: 'Sucrier', nameAr: 'سكرية', descriptionFr: 'Sucrier élégant.', descriptionAr: 'سكرية أنيقة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Sucrier' },
  { id: 'm2', category: 'maison', price: 100, nameFr: 'Fouet de cuisine', nameAr: 'خفاقة مطبخ', descriptionFr: 'Pour vos préparations.', descriptionAr: 'لتحضير الطعام', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Fouet%20de%20cuisine' },
  { id: 'm3', category: 'maison', price: 100, nameFr: 'Insecticide (Litox)', nameAr: 'مبيد حشرات ليتوكس', descriptionFr: 'Aérosol.', descriptionAr: 'مضاد للحشرات', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Insecticide%20(Litox)' },
  { id: 'm4', category: 'maison', price: 100, nameFr: 'Briquet', nameAr: 'ولاعة / بريكي', descriptionFr: 'Briquet de poche.', descriptionAr: 'ولاعة جيب', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Briquet' },
  { id: 'm5', category: 'maison', price: 50, nameFr: 'Couteau de cuisine (Standard)', nameAr: 'سكين عادي', descriptionFr: 'Petit couteau.', descriptionAr: 'سكين صغير', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Couteau%20de%20cuisine%20(Standard)' },
  { id: 'm6', category: 'maison', price: 100, nameFr: 'Couteau de cuisine (Moyen)', nameAr: 'سكين متوسط', descriptionFr: 'Tranchant moyen.', descriptionAr: 'جودة جيدة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Couteau%20de%20cuisine%20(Moyen)' },
  { id: 'm7', category: 'maison', price: 150, nameFr: 'Couteau de cuisine (Pro)', nameAr: 'سكين ممتاز', descriptionFr: 'Lame très tranchante.', descriptionAr: 'شفرة حادة صلبة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Couteau%20de%20cuisine%20(Pro)' },
  { id: 'b1', category: 'bricolage', price: 100, nameFr: 'Lampe LED 9W', nameAr: 'مصباح 9 واط', descriptionFr: 'Ampoule économique.', descriptionAr: 'مصباح اقتصادي', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Lampe%20LED%209W' },
  { id: 'b2', category: 'bricolage', price: 200, nameFr: 'Lampe LED 18W', nameAr: 'مصباح 18 واط', descriptionFr: 'Éclairage puissant.', descriptionAr: 'إضاءة قوية', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Lampe%20LED%2018W' },
  { id: 'b3', category: 'bricolage', price: 600, nameFr: 'Pelle de chantier', nameAr: 'رفش / بالة', descriptionFr: 'Pelle solide.', descriptionAr: 'رفش صلب', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Pelle%20de%20chantier' },
  { id: 'b4', category: 'bricolage', price: 500, nameFr: 'Scie manuelle', nameAr: 'منشار يدوي', descriptionFr: 'Scie pour bois/métal.', descriptionAr: 'منشار احترافي', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Scie%20manuelle' },
  { id: 'h1', category: 'hygiene', price: 100, nameFr: 'Brosse à dents', nameAr: 'فرشاة أسنان', descriptionFr: 'Poils souples.', descriptionAr: 'شعيرات ناعمة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Brosse%20%C3%A0%20dents' },
  { id: 'h2', category: 'hygiene', price: 100, nameFr: 'Dentifrice (Petit)', nameAr: 'معجون أسنان صغير', descriptionFr: 'Volume standard.', descriptionAr: 'حجم عادي', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Dentifrice%20(Petit)' },
  { id: 'h3', category: 'hygiene', price: 200, nameFr: 'Dentifrice (Grand)', nameAr: 'معجون أسنان كبير', descriptionFr: 'Grand volume familial.', descriptionAr: 'حجم عائلي كبير', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Dentifrice%20(Grand)' },
  { id: 'v5', category: 'vetements_homme', price: 200, nameFr: 'Chemise Classique', nameAr: 'قميص كلاسيكي', descriptionFr: 'Chemise élégante.', descriptionAr: 'قميص أنيق', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Chemise%20Classique' },
  { id: 'v6', category: 'vetements_homme', price: 100, nameFr: 'Casquette', nameAr: 'كاسكيطة', descriptionFr: 'Casquette classique.', descriptionAr: 'قبعة صيفية', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Casquette' },
  { id: 'm8', category: 'maison', price: 100, nameFr: 'Éponge métallique (3 pcs)', nameAr: 'حبل غسل الأواني', descriptionFr: 'Lot de 3 pour la vaisselle.', descriptionAr: '3 بـ 100 دج', image: 'https://placehold.co/400x300/e2e8f0/334155?text=%C3%89ponge%20m%C3%A9tallique%20(3%20pcs)' },
  { id: 'p6', category: 'plastique', price: 50, nameFr: 'Pelle en plastique (Petit)', nameAr: 'مجرفة بلاستيك (صغير)', descriptionFr: 'Petite pelle.', descriptionAr: 'مجرفة صغيرة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Pelle%20en%20plastique%20(Petit)' },
  { id: 'p7', category: 'plastique', price: 75, nameFr: 'Pelle en plastique (Moyen)', nameAr: 'مجرفة بلاستيك (متوسط)', descriptionFr: 'Taille moyenne.', descriptionAr: 'مجرفة متوسطة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Pelle%20en%20plastique%20(Moyen)' },
  { id: 'p8', category: 'plastique', price: 100, nameFr: 'Pelle en plastique (Grand)', nameAr: 'مجرفة بلاستيك (كبير)', descriptionFr: 'Grande pelle robuste.', descriptionAr: 'مجرفة كبيرة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Pelle%20en%20plastique%20(Grand)' },
  { id: 'h4', category: 'hygiene', price: 50, nameFr: 'Coton-tige (Petit Modele)', nameAr: 'قطن الأذن (صغير)', descriptionFr: 'Petite boîte.', descriptionAr: 'حجم صغير', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Coton-tige%20(Petit%20Modele)' },
  { id: 'h5', category: 'hygiene', price: 100, nameFr: 'Coton-tige (Grand Modele)', nameAr: 'قطن الأذن (كبير)', descriptionFr: 'Grande boîte.', descriptionAr: 'حجم كبير', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Coton-tige%20(Grand%20Modele)' },
  { id: 'm9', category: 'maison', price: 50, nameFr: 'Cuillère (Petit Modele)', nameAr: 'ملعقة (صغيرة)', descriptionFr: 'Pour dessert ou café.', descriptionAr: 'للتحلية أو القهوة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Cuill%C3%A8re%20(Petit%20Modele)' },
  { id: 'm10', category: 'maison', price: 100, nameFr: 'Cuillère (Grand Modele)', nameAr: 'ملعقة (كبيرة)', descriptionFr: 'Pour soupe.', descriptionAr: 'للشوربة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Cuill%C3%A8re%20(Grand%20Modele)' },
  { id: 'e1', category: 'electronique', price: 3500, nameFr: 'Télévision LG Ancien Modèle', nameAr: 'تلفاز LG قديم', descriptionFr: 'Téléphone LG LCD/Plasma ancien modèle.', descriptionAr: 'تلفاز LG تصميم قديم', image: 'https://placehold.co/400x300/e2e8f0/334155?text=T%C3%A9l%C3%A9vision%20LG%20Ancien%20Mod%C3%A8le' },
  { id: 'm11', category: 'maison', price: 100, nameFr: 'Corbeille à pain', nameAr: 'سلة خبز', descriptionFr: 'Corbeille en plastique pour le pain.', descriptionAr: 'سلة خبز بلاستيكية', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Corbeille%20%C3%A0%20pain' },
  { id: 'm12', category: 'maison', price: 100, nameFr: 'Économe de cuisine', nameAr: 'قشارة خضار', descriptionFr: 'Pour éplucher vos légumes facilement.', descriptionAr: 'لتقشير الخضار', image: 'https://placehold.co/400x300/e2e8f0/334155?text=%C3%89conome%20de%20cuisine' },
  { id: 'm13', category: 'maison', price: 100, nameFr: 'Serpillère (Nechaf)', nameAr: 'نشاف الأرض', descriptionFr: 'Serpillère absorbante pour le sol.', descriptionAr: 'نشاف لتنظيف الأرض', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Serpill%C3%A8re%20(Nechaf)' },
  { id: 'pa1', category: 'papeterie', price: 50, nameFr: 'Stylo Marqueur', nameAr: 'قلم ماركر', descriptionFr: 'Marqueur de couleur.', descriptionAr: 'قلم ماركر', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Stylo%20Marqueur' },
  { id: 'b5', category: 'bricolage', price: 50, nameFr: 'Cutter', nameAr: 'كيتور', descriptionFr: 'Outil de coupe tranchant.', descriptionAr: 'قاطع (كيتور)', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Cutter' },
  { id: 'm14', category: 'maison', price: 50, nameFr: 'Passoire (Petit)', nameAr: 'صفاية صغيرة', descriptionFr: 'Petite passoire de cuisine.', descriptionAr: 'صفاية حجم صغير', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Passoire%20(Petit)' },
  { id: 'm15', category: 'maison', price: 100, nameFr: 'Râpe à légumes', nameAr: 'سكرفاج', descriptionFr: 'Râpe de cuisine.', descriptionAr: 'مبشرة خضار / سكرفاج', image: 'https://placehold.co/400x300/e2e8f0/334155?text=R%C3%A2pe%20%C3%A0%20l%C3%A9gumes' },
  { id: 'm16', category: 'maison', price: 100, nameFr: 'Corde à linge', nameAr: 'حبل غسيل', descriptionFr: 'Corde pour ranger les vêtements.', descriptionAr: 'حبل نشر الملابس', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Corde%20%C3%A0%20linge' },
  { id: 'j5', category: 'jouets', price: 100, nameFr: 'Jouet Fille', nameAr: 'لعبة بنات', descriptionFr: 'Jouet pour fille (poupée, dînette...).', descriptionAr: 'لعبة بنات', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Jouet%20Fille' },
  { id: 'j6', category: 'jouets', price: 100, nameFr: 'Jouet Enfant', nameAr: 'لعبة أطفال', descriptionFr: 'Jouet divertissant pour enfant.', descriptionAr: 'لعبة أطفال متنوعة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Jouet%20Enfant' },
  { id: 'm17', category: 'maison', price: 100, nameFr: 'Pinces à linge (Mssak)', nameAr: 'مساك حوايج', descriptionFr: 'Lot de pinces pour vêtements.', descriptionAr: 'مجموعة مساك', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Pinces%20%C3%A0%20linge%20(Mssak)' },
  { id: 'm18', category: 'maison', price: 100, nameFr: 'Brosse de nettoyage (Chita)', nameAr: 'شيتة تنظيف', descriptionFr: 'Brosse rugueuse de nettoyage.', descriptionAr: 'شيتة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Brosse%20de%20nettoyage%20(Chita)' },
  { id: 'm19', category: 'maison', price: 100, nameFr: 'Balai', nameAr: 'بالي (مكنسة)', descriptionFr: 'Balai classique pour sol.', descriptionAr: 'مكنسة تنظيف', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Balai' },
  { id: 'm20', category: 'maison', price: 100, nameFr: 'Manche à Balai / Frottoir', nameAr: 'عصا بالي / فواطوار', descriptionFr: 'Manche robuste pour balai.', descriptionAr: 'عصا مكنسة', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Manche%20%C3%A0%20Balai%20%2F%20Frottoir' },
  { id: 'm21', category: 'maison', price: 100, nameFr: 'Serviette Viscose (30x40)', nameAr: 'منديل فيسكوز 30/40', descriptionFr: 'Serviette multi-usage absorbante.', descriptionAr: 'منديل تنظيف فيسكوز', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Serviette%20Viscose%20(30x40)' },
  { id: 'm22', category: 'maison', price: 100, nameFr: 'Torchon (Grand Modèle)', nameAr: 'طرشون كبير', descriptionFr: 'Grand torchon de cuisine.', descriptionAr: 'طرشون مطبخ كبير', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Torchon%20(Grand%20Mod%C3%A8le)' },
  { id: 'm23', category: 'maison', price: 200, nameFr: 'Lot de 6 Torchons (Petit)', nameAr: '6 طراشن صغار', descriptionFr: '6 pièces petit format.', descriptionAr: '6 قطع حجم صغير', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Lot%20de%206%20Torchons%20(Petit)' },
  { id: 'h6', category: 'hygiene', price: 150, nameFr: 'Parfum Lorage', nameAr: 'عطر لوراج', descriptionFr: 'Déodorant / Parfum Lorage.', descriptionAr: 'عطر منعش', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Parfum%20Lorage' },
  { id: 'pk1', category: 'packs', price: 300, nameFr: 'Pack Ménage (Promo)', nameAr: 'باك (مساك، فليتوكس، بالي، حبل)', descriptionFr: 'Pinces, Insecticide, Balai, Corde à linge.', descriptionAr: 'مجموعة تنظيف اقتصادية', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Pack%20M%C3%A9nage%20(Promo)' },
  { id: 'p9', category: 'plastique', price: 100, nameFr: 'Chaise en plastique', nameAr: 'كرسي بلاستيك', descriptionFr: 'Tabouret / chaise en plastique.', descriptionAr: 'كرسي بلاستيكي صغير', image: 'https://placehold.co/400x300/e2e8f0/334155?text=Chaise%20en%20plastique' }
];

const CATEGORIES_LIST = [
  { id: 'vehicules', icon: Car, fr: 'Véhicules', ar: 'مركبات' },
  { id: 'locations', icon: Key, fr: 'Locations', ar: 'إيجارات' },
  { id: 'vetements_femme', icon: Shirt, fr: 'Prêt à porter femme', ar: 'ملابس نسائية' },
  { id: 'vetements_homme', icon: Shirt, fr: 'Prêt à porter homme', ar: 'ملابس رجالية' },
  { id: 'meubles', icon: Sofa, fr: 'Meubles', ar: 'أثاث' },
  { id: 'electronique', icon: Tv, fr: 'Appareils électroniques', ar: 'أجهزة إلكترونية' },
  { id: 'antiquites', icon: Gem, fr: 'Antiquités et objets de collection', ar: 'تحف ومقتنيات' },
  { id: 'art', icon: Palette, fr: 'Art et artisanat', ar: 'فنون وحرف' },
  { id: 'pieces_auto', icon: Settings, fr: 'Pièces automobiles', ar: 'قطع غيار السيارات' },
  { id: 'bebes', icon: Baby, fr: 'Bébés', ar: 'رضع' },
  { id: 'livres', icon: Book, fr: 'Livres, films et musique', ar: 'كتب، أفلام وموسيقى' },
  { id: 'videgrenier', icon: Store, fr: 'Vide-grenier', ar: 'مستعمل' },
  { id: 'sante', icon: Heart, fr: 'Santé et beauté', ar: 'صحة وجمال' },
  { id: 'maison', icon: Home, fr: 'Maison et cuisine', ar: 'المنزل والمطبخ' },
  { id: 'bricolage', icon: Hammer, fr: 'Bricolage', ar: 'أدوات' },
  { id: 'immobilier', icon: Key, fr: 'Vente de logements', ar: 'بيع مساكن' },
  { id: 'bijoux', icon: Watch, fr: 'Bijoux et montres', ar: 'مجوهرات وساعات' },
  { id: 'vetements_enfants', icon: Shirt, fr: 'Vêtements pour enfants et bébés', ar: 'ملابس أطفال ورضع' },
  { id: 'bagages', icon: Briefcase, fr: 'Bagages et sacs', ar: 'حقائب وأمتعة' },
  { id: 'divers', icon: Archive, fr: 'Divers', ar: 'متنوعات' },
  { id: 'musique', icon: Music, fr: 'Instruments de musique', ar: 'آلات موسيقية' },
  { id: 'jardin', icon: TreePine, fr: 'Patio et jardin', ar: 'فناء وحديقة' },
  { id: 'animaux', icon: Dog, fr: 'Produits pour animaux', ar: 'منتجات الحيوانات' },
  { id: 'sport', icon: Dumbbell, fr: 'Articles de sport', ar: 'أدوات رياضية' },
  { id: 'jouets', icon: Gamepad2, fr: 'Jeux et jouets', ar: 'ألعاب' },
  { id: 'plastique', icon: Package, fr: 'Plastique', ar: 'بلاستيك' },
  { id: 'hygiene', icon: Sparkles, fr: 'Hygiène', ar: 'نظافة' },
  { id: 'papeterie', icon: PenTool, fr: 'Papeterie', ar: 'قرطاسية' },
  { id: 'packs', icon: Gift, fr: 'Packs Promo', ar: 'عروض' }
] as const;

// --- Sub-components ---

const ProductCard = ({ product, onAdd, onEditImage }: { product: Product, onAdd: (p: Product) => void, onEditImage: (p: Product) => void }) => (
  <div className="bg-theme-secondary rounded-[12px] border border-theme-border shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-[12px] flex flex-col gap-[8px] transition-transform hover:-translate-y-1 relative group">
    <div className="h-[100px] bg-[#f0f2f0] rounded-[8px] flex items-center justify-center overflow-hidden shrink-0 relative">
      <img src={product.image} alt={product.nameFr} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      <button 
        onClick={(e) => { e.stopPropagation(); onEditImage(product); }}
        className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-theme-text shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        title="Éditer l'image avec l'IA"
      >
        <Pencil size={14} />
      </button>
    </div>
    <div className="flex flex-col flex-grow">
      <div className="text-[14px] font-semibold text-theme-text">{product.nameFr}</div>
      <div className="text-[11px] text-theme-muted">{product.nameAr}</div>
      <div className="text-[16px] text-theme-primary font-bold mt-2">{product.price} DA</div>
    </div>
    <button 
      onClick={() => onAdd(product)}
      className="w-full mt-1 p-[8px] bg-theme-primary text-white border-none rounded-[6px] text-[12px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
    >
      Ajouter au Panier
    </button>
  </div>
);

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
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.2 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[320px] bg-theme-secondary z-50 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col rounded-l-[12px]"
          >
            <div className="p-[20px] bg-[#f8f9fa] border-b border-theme-border flex justify-between items-center rounded-tl-[12px]">
              <span className="text-[14px] font-bold text-theme-text">Mon Panier / سلة التسوق</span>
              <span className="text-theme-muted flex items-center gap-2">
                <span className="text-[13px]">{cart.reduce((sum, item) => sum + item.quantity, 0)} Articles</span>
                <button onClick={onClose} className="hover:text-theme-primary"><X size={16} /></button>
              </span>
            </div>

            <div className="flex-grow overflow-y-auto p-[15px] flex flex-col gap-[12px]">
              {cart.length === 0 ? (
                <div className="text-center text-theme-muted mt-8 text-[13px]">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  Votre panier est vide
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-[10px] items-center text-[13px]">
                    <div className="w-[40px] h-[40px] bg-[#f0f2f0] rounded-[6px] overflow-hidden shrink-0">
                      <img src={item.product.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <strong className="text-theme-text block">{item.product.nameFr}</strong>
                      <span className="text-theme-primary font-medium">{item.quantity} x {item.product.price} DA</span>
                    </div>
                    <button onClick={() => onRemove(item.product.id)} className="p-1.5 text-theme-muted hover:text-red-500 rounded-[4px] transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-[20px] border-t border-theme-border bg-white rounded-bl-[12px]">
                <div className="flex justify-between items-center py-[10px] mb-2 font-bold text-theme-text border-t border-theme-border">
                  <span className="text-[14px]">TOTAL</span>
                  <span className="text-[16px] text-theme-primary">{total} DA</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full py-[12px] bg-theme-primary text-white border-none rounded-[6px] font-bold text-[13px] cursor-pointer hover:opacity-90 transition-opacity"
                >
                  CONFIRMER COMMANDE
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- App Main Component ---
export default function App() {
  const [view, setView] = useState<'home' | 'products' | 'checkout' | 'success'>('home');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Image editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.product.id !== id));
  
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const navigateTo = (newView: 'home' | 'products' | 'checkout' | 'success') => {
    setView(newView);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCart([]);
    navigateTo('success');
  };

  // Use the products state for filtering
  const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);

  return (
    <div className="flex flex-col min-h-screen bg-theme-bg text-theme-text font-sans">
      
      {/* HEADER */}
      <header className="h-[70px] bg-theme-secondary border-b border-theme-border flex items-center justify-between px-[20px] md:px-[30px] shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-[10px] font-extrabold text-[18px] md:text-[20px] text-theme-primary cursor-pointer" onClick={() => navigateTo('home')}>
          <div className="w-[40px] h-[40px] rounded-[6px] flex items-center justify-center overflow-hidden shrink-0 bg-theme-bg">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <div className="hidden w-full h-full bg-theme-primary flex items-center justify-center text-white text-[14px]">
              C
            </div>
          </div>
          <span className="flex items-center gap-[6px]">Cherchell Shopping <span className="font-light opacity-70 text-[14px] mt-0.5">| 100 DA</span></span>
        </div>

        <nav className="hidden md:block">
          <ul className="flex gap-[30px] list-none m-0 p-0 text-[14px]">
            <li><button onClick={() => navigateTo('home')} className={`font-medium transition-colors ${view === 'home' ? 'text-theme-primary' : 'text-theme-text hover:text-theme-primary'}`}>Accueil</button></li>
            <li><button onClick={() => navigateTo('products')} className={`font-medium transition-colors ${view === 'products' ? 'text-theme-primary' : 'text-theme-text hover:text-theme-primary'}`}>Produits</button></li>
            <li><button onClick={() => document.getElementById('contact')?.scrollIntoView()} className="font-medium text-theme-text hover:text-theme-primary transition-colors">Contact</button></li>
          </ul>
        </nav>

        <div className="flex items-center gap-[15px]">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-theme-primary text-white py-[8px] px-[16px] rounded-[20px] flex items-center gap-[8px] text-[14px] cursor-pointer hover:opacity-90"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Panier </span>
            <span>({cartItemCount})</span>
          </button>
          <button className="md:hidden text-theme-text" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-[70px] w-full bg-theme-secondary text-theme-text z-30 md:hidden flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden border-b border-theme-border"
          >
            <button onClick={() => navigateTo('home')} className="p-[15px] border-b border-theme-border text-left font-medium text-[14px]">Accueil / الرئيسية</button>
            <button onClick={() => navigateTo('products')} className="p-[15px] border-b border-theme-border text-left font-medium text-[14px]">Produits / المنتجات</button>
            <button onClick={() => {setIsMobileMenuOpen(false); document.getElementById('contact')?.scrollIntoView();}} className="p-[15px] text-left font-medium text-[14px]">Contact / اتصال</button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          navigateTo('checkout');
        }}
      />

      <main className="flex-grow w-full max-w-[1024px] mx-auto p-[20px] flex flex-col md:flex-row gap-[20px] items-start">
        
        {/* SIDEBAR FOR LAYOUT MATCH (Categories) */}
        {(view === 'home' || view === 'products') && (
          <aside className="w-full md:w-[220px] shrink-0 bg-theme-secondary rounded-[12px] p-[20px] flex flex-col gap-[25px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-theme-border">
            <div>
              <h3 className="text-[12px] uppercase tracking-[1px] text-theme-muted mb-[15px] font-bold">Catégories</h3>
              <ul className="list-none flex md:flex-col gap-2 md:gap-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {CATEGORIES_LIST.map(cat => (
                  <li key={cat.id} className="min-w-[140px] md:min-w-0">
                    <button 
                      onClick={() => { setCategory(cat.id as Category); navigateTo('products'); }}
                      className={`w-full flex items-center gap-[12px] p-[10px] md:px-0 md:py-[10px] cursor-pointer md:border-b md:border-[#f8f9f9] text-[14px] text-left transition-colors ${category === cat.id ? 'text-theme-primary' : 'text-theme-text hover:text-theme-primary'}`}
                    >
                      <span className="w-[32px] h-[32px] bg-[#e8f5e9] text-theme-primary rounded-full flex items-center justify-center shrink-0">
                        <cat.icon size={16} />
                      </span>
                      <div className="leading-tight">
                        <strong className="block">{cat.fr}</strong>
                        <small className="text-theme-muted text-[11px]">{cat.ar}</small>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto hidden md:block">
              <p className="text-[12px] text-theme-muted leading-[1.4]">Le meilleur de nos articles à 100 DA et des prix imbattables !</p>
            </div>
          </aside>
        )}

        <div className="flex-grow w-full flex flex-col gap-[20px] overflow-hidden">
          
          {/* HOME COMPONENT */}
          {view === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-[20px]">
              <div className="h-auto md:h-[120px] bg-gradient-to-br from-theme-primary to-[#008746] rounded-[12px] p-[25px] text-white flex flex-col justify-center relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.05)] shrink-0">
                <h2 className="text-[20px] md:text-[24px] font-bold mb-[5px] relative z-10">Promotion Spéciale</h2>
                <p className="text-[14px] opacity-90 relative z-10">Toutes les catégories sont disponibles maintenant. Livraison 48 Wilayas.</p>
                <div className="absolute right-[20px] -bottom-[20px] text-[80px] opacity-10 font-bold pointer-events-none select-none">KOULCHI</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px]">
                {products.slice(0, 6).map(product => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} onEditImage={setEditingProduct} />
                ))}
              </div>
              
              <div className="flex justify-center mt-2">
                 <button 
                    onClick={() => navigateTo('products')}
                    className="bg-theme-secondary border border-theme-border text-theme-text font-bold text-[14px] px-[24px] py-[12px] rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:text-theme-primary transition-colors flex items-center gap-2"
                  >
                    Voir tous les produits <ChevronRight size={16}/>
                  </button>
              </div>
            </motion.div>
          )}

          {/* PRODUCTS COMPONENT */}
          {view === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-[20px] w-full">
              <div className="flex flex-wrap gap-[10px]">
                {[{ id: 'all', fr: 'Tout', ar: 'الكل' }, ...CATEGORIES_LIST].map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setCategory(cat.id as Category | 'all')}
                    className={`px-[16px] py-[8px] rounded-[20px] text-[13px] font-semibold transition-colors flex items-center gap-[6px] border shadow-sm ${
                      category === cat.id ? 'bg-theme-primary text-white border-theme-primary' : 'bg-theme-secondary text-theme-muted border-theme-border hover:text-theme-primary hover:border-theme-primary'
                    }`}
                  >
                    <span>{cat.fr}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px] pb-[20px]">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} onEditImage={setEditingProduct} />
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-20 text-theme-muted bg-theme-secondary rounded-[12px] border border-theme-border">
                  <Package size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-[14px]">Aucun produit trouvé.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* CHECKOUT COMPONENT */}
          {view === 'checkout' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-theme-secondary border border-theme-border rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
              <div className="p-[20px] bg-[#f8f9fa] border-b border-theme-border font-bold text-[16px] text-theme-text flex items-center justify-between">
                <span>Finaliser la commande</span>
                <span className="text-[13px] text-theme-muted font-normal text-right">إكمال الطلب</span>
              </div>

              {cart.length === 0 ? (
                <div className="p-[40px] text-center text-theme-muted">
                  <p className="mb-[15px] text-[14px]">Votre panier est vide.</p>
                  <button onClick={() => navigateTo('products')} className="text-theme-primary font-bold text-[14px] hover:underline">Retourner aux produits</button>
                </div>
              ) : (
                <div className="p-[20px] md:p-[30px] flex flex-col md:flex-row gap-[30px]">
                  
                  <div className="flex-grow">
                    <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-[10px]">
                      <input required type="text" className="w-full p-[10px] border border-theme-border rounded-[6px] text-[13px] outline-none focus:border-theme-primary transition-colors text-theme-text bg-white" placeholder="Nom Complet / الاسم الكامل" />
                      <input required type="tel" className="w-full p-[10px] border border-theme-border rounded-[6px] text-[13px] outline-none focus:border-theme-primary transition-colors text-theme-text bg-white" placeholder="Téléphone / رقم الهاتف (ex: 05XX XX XX XX)" />
                      <input required type="text" className="w-full p-[10px] border border-theme-border rounded-[6px] text-[13px] outline-none focus:border-theme-primary transition-colors text-theme-text bg-white" placeholder="Wilaya / الولاية" />
                      
                      <div className="mt-[5px] mb-[10px] bg-[#e8f5e9] p-[15px] rounded-[8px] flex items-start gap-[10px] border border-[#c8e6c9]">
                        <Truck className="text-theme-primary shrink-0 mt-[2px]" size={16} />
                        <div>
                          <p className="font-bold text-theme-primary text-[12px]">Paiement à la livraison</p>
                          <p className="text-[11px] text-[#2e7d32] mt-1">الدفع عند الاستلام. Des frais de livraison peuvent s'appliquer.</p>
                        </div>
                      </div>

                      <button type="submit" className="w-full p-[12px] bg-theme-primary text-white font-bold rounded-[6px] text-[13px] shadow-sm hover:opacity-90 transition-opacity mt-2">
                        CONFIRMER COMMANDE
                      </button>
                    </form>
                  </div>

                  <div className="w-full md:w-[280px] shrink-0">
                    <div className="mb-[20px] border border-theme-border rounded-[8px] bg-[#f8f9fa] shadow-sm flex flex-col overflow-hidden">
                      <div className="p-[15px] border-b border-theme-border">
                        <h3 className="font-bold text-theme-text text-[13px]">Résumé / ملخص الطلب</h3>
                      </div>
                      <div className="p-[15px] flex flex-col">
                        {cart.map(item => (
                          <div key={item.product.id} className="flex justify-between text-[13px] mb-3 text-theme-text last:mb-0">
                            <span>{item.quantity}x {item.product.nameFr}</span>
                            <span className="font-medium text-theme-primary">{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-[15px] bg-white border-t border-theme-border flex justify-between font-bold text-[14px] text-theme-text">
                        <span>TOTAL</span>
                        <span className="text-theme-primary text-[16px]">{cartTotal} DA</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SUCCESS COMPONENT */}
          {view === 'success' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-theme-secondary border border-theme-border rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-[40px] text-center flex flex-col items-center justify-center flex-grow">
              <div className="w-[64px] h-[64px] bg-[#e8f5e9] text-theme-primary rounded-full mb-[20px] flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-[20px] font-bold text-theme-text mb-[5px]">Commande Confirmée !</h2>
              <h3 className="text-[14px] font-medium text-theme-muted mb-[15px]" dir="rtl">تم تأكيد طلبك!</h3>
              <p className="text-[14px] text-theme-text mb-[25px]">Nous vous contacterons très bientôt pour la livraison.</p>
              <button 
                onClick={() => navigateTo('home')}
                className="bg-theme-text text-white font-bold py-[10px] px-[24px] rounded-[6px] text-[13px] hover:bg-opacity-90 transition-opacity"
              >
                Retour à l'accueil
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <footer id="contact" className="h-auto md:h-[60px] bg-theme-secondary border-t border-theme-border flex flex-col md:flex-row items-center justify-between px-[20px] md:px-[30px] text-[12px] text-theme-muted shrink-0 py-4 md:py-0 mt-auto">
        <div className="mb-2 md:mb-0 text-center md:text-left">© {new Date().getFullYear()} Cherchell Shopping 100 DA - Tous droits réservés | كل الحقوق محفوظة</div>
        <div className="flex gap-[10px] text-theme-primary font-semibold mb-2 md:mb-0">
          <span>FR</span>
          <span>|</span>
          <span dir="rtl">العربية</span>
        </div>
        <div>
          Contact: +213 555 00 00 00 | Suivez-nous: FB / IG
        </div>
      </footer>

      {/* Image Editor Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[16px] w-full max-w-[500px] overflow-hidden shadow-2xl"
            >
              <div className="p-[20px] border-b flex justify-between items-center text-black">
                <h2 className="font-bold text-[18px]">Créez l'image avec l'IA</h2>
                <button onClick={() => { setEditingProduct(null); setImagePrompt(''); }} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-[20px] flex gap-4 text-black">
                <div className="w-[120px] h-[120px] shrink-0 bg-gray-100 rounded-[8px] overflow-hidden">
                  <img src={editingProduct.image} alt="current" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow flex flex-col gap-3">
                  <div>
                    <h3 className="font-semibold text-[14px]">{editingProduct.nameFr}</h3>
                    <p className="text-[12px] text-gray-500">{editingProduct.descriptionFr}</p>
                  </div>
                  <textarea 
                    className="w-full resize-none border rounded-[8px] p-[10px] text-[13px] outline-none focus:border-theme-primary"
                    rows={3}
                    placeholder="Ex: Une photo professionnelle d'une chaise en plastique blanc sur fond neutre..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-[20px] border-t bg-gray-50 flex justify-end">
                <button 
                  disabled={isGenerating}
                  onClick={async () => {
                    const studio = (window as any).aistudio;
                    if (studio) {
                      if (!(await studio.hasSelectedApiKey())) {
                        await studio.openSelectKey();
                      }
                    }
                    
                    const apiKey = process.env.GEMINI_API_KEY || (process as any).env.API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
                    if (!apiKey) {
                      alert("Veuillez configurer une clé API Gemini pour pouvoir générer des images.");
                      return;
                    }

                    setIsGenerating(true);
                    try {
                      const ai = new GoogleGenAI({ apiKey });
                      const finalPrompt = imagePrompt.trim() !== '' 
                        ? imagePrompt 
                        : `A high quality, realistic e-commerce product photo with a pure white background of: ${editingProduct.nameFr}. No text or extra objects.`;
                      
                      const response = await ai.models.generateContent({
                        model: 'gemini-3.1-flash-image-preview',
                        contents: {
                          parts: [{ text: finalPrompt }]
                        }
                      });

                      let newImgUrl = '';
                      const parts = response.candidates?.[0]?.content?.parts || [];
                      for (const part of parts) {
                        if (part.inlineData) {
                          newImgUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                          break;
                        }
                      }

                      if (newImgUrl) {
                        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, image: newImgUrl } : p));
                        setEditingProduct(null);
                        setImagePrompt('');
                      } else {
                        alert("L'IA n'a pas pu générer l'image. Veuillez réessayer.");
                      }
                    } catch (e) {
                      console.error("Image generation error:", e);
                      alert("Erreur lors de la génération. Assurez-vous d'avoir une clé API valide.");
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  className="bg-theme-primary text-white font-bold text-[14px] px-[20px] py-[10px] rounded-[6px] hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Génération...</> : <><Sparkles size={16} /> Générer</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
