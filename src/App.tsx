import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Trash2, Package, Shirt, Gamepad2, CheckCircle, ChevronRight, MapPin, Truck, Phone, Home, Hammer, Sparkles, Tv, PenTool, Gift, Pencil, Loader2, Car, Settings, Baby, Briefcase, Music, TreePine, Dog, Key, Dumbbell, Book, Sofa, Store, Heart, Watch, Gem, Palette, Archive, Activity, LockIcon, LogOut, Upload, Plus, LayoutDashboard, ShoppingBag, Layers, ArrowRight, ChevronDown, Banknote, PhoneCall, Moon, Sun, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { removeBackground } from '@imgly/background-removal';
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: any = null;
const getAiClient = () => {
  if (!aiClient) {
    // @ts-ignore
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("API key not found, AI generation will fail");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }
  return aiClient;
};

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
  { id: 'm19', category: 'maison', price: 100, nameFr: 'Balai', nameAr: 'بالي (مكنسة)', descriptionFr: 'Balai classique pour sol.', descriptionAr: 'مكنسة تنظيف', image: '/Balai.png' },
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

const ProductCard: React.FC<{ product: Product, onAdd: (p: Product) => void }> = ({ product, onAdd }) => (
  <div className="bg-theme-secondary rounded-[16px] shadow-sm ring-1 ring-theme-border p-[14px] flex flex-col gap-[12px] transition-all hover:-translate-y-1 hover:shadow-md relative group">
    <div className="aspect-square bg-theme-bg rounded-[10px] flex items-center justify-center overflow-hidden shrink-0 relative border border-theme-border/50">
      <img src={product.image} alt={product.nameFr} className="w-full h-full object-contain p-2 mix-blend-multiply" referrerPolicy="no-referrer" />
    </div>
    <div className="flex flex-col flex-grow px-1">
      <div className="text-[15px] font-bold text-theme-text leading-tight line-clamp-1 tracking-tight" title={product.nameFr}>{product.nameFr}</div>
      <div className="text-[12px] text-theme-muted line-clamp-1 mt-0.5" title={product.nameAr}>{product.nameAr}</div>
      
      {(product.descriptionFr || product.descriptionAr) && (
        <div className="text-[13px] text-theme-muted mt-2 line-clamp-2 leading-relaxed opacity-80" title={`${product.descriptionFr} ${product.descriptionAr}`}>
          {product.descriptionFr}
          {product.descriptionFr && product.descriptionAr && ' • '}
          <span dir="rtl">{product.descriptionAr}</span>
        </div>
      )}

      <div className="text-[18px] text-theme-text font-extrabold mt-auto pt-3 tracking-tight">{product.price} DA</div>
    </div>
    <button 
      onClick={() => onAdd(product)}
      className="w-full mt-2 p-[10px] bg-theme-bg text-theme-text ring-1 ring-theme-border rounded-[10px] text-[13px] font-bold cursor-pointer hover:bg-theme-text hover:text-theme-secondary hover:ring-0 transition-all flex-shrink-0"
    >
      Ajouter
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
        <motion.div 
          key="overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div 
          key="drawer"
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
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'products' | 'checkout' | 'success' | 'admin'>('home');
  const [category, setCategory] = useState<Category>('divers');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const dynamicProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const allProducts = [...INITIAL_PRODUCTS, ...dynamicProducts];
        const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values())
          .filter((p: any) => !p.deleted);
        setProducts(uniqueProducts);
      } catch (err) {
        setProducts(INITIAL_PRODUCTS);
      }
    };
    fetchProducts();
  }, []);

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
          if (!blob) return reject();
          try {
            const noBgBlob = await removeBackground(URL.createObjectURL(blob));
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(noBgBlob);
          } catch(e) {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }
        }, 'image/webp', 0.8);
      };
      img.onerror = reject;
    });
  };

  const handleImageUpload = async (file: File, p: Product) => {
    try {
      setIsProcessingImage(true);
      const imgData = await processImage(file);
      const updatedProduct = { ...p, image: imgData };
      await setDoc(doc(db, 'products', p.id), updatedProduct);
      setProducts(prev => prev.map(prod => prod.id === p.id ? updatedProduct : prod));
      showToast("Image du produit mise à jour");
    } catch(e) {
      alert("Erreur");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const generateMetadataForProduct = async (name: string) => {
    try {
      setIsGeneratingMetadata(true);
      const result = await getAiClient().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an assistant for a store in Algeria. Generate metadata for this product: "${name}".
        Provide ONLY valid JSON with no markdown formatting. The JSON must contain exactly these keys: "nameAr", "descriptionFr" (short marketing phrase), "descriptionAr", "category" (one of: ${CATEGORIES_LIST.map(c=>c.id).join(', ')}).`
      });
      let text = result.text || "{}";
      text = text.replace(/```(json)?\n?/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(text);
      setNewProduct(prev => ({ ...prev, ...data }));
    } catch (error: any) {
      console.error(error);
      alert("Erreur IA: " + (error?.message || "Erreur inconnue"));
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const handleNewProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newProduct.nameFr || !newProduct.price || !newProduct.category) return;
    try {
      setIsSavingProduct(true);
      const isEditing = !!newProduct.id;
      const id = newProduct.id || Date.now().toString();
      const productData = { 
        ...newProduct, 
        id, 
        image: newProduct.image || `https://placehold.co/400x300/e2e8f0/334155?text=${encodeURIComponent(newProduct.nameFr || '')}` 
      } as Product;
      await setDoc(doc(db, 'products', id), productData);
      setProducts(prev => isEditing ? prev.map(p => p.id === id ? productData : p) : [productData, ...prev]);
      setIsNewProductModalOpen(false);
      setNewProduct({ category: 'divers' });
      showToast(isEditing ? "Produit modifié avec succès" : "Produit ajouté avec succès");
    } catch(e) {
      alert('Erreur: ' + (e as Error).message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const totalCart = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = 200;

  return (
    <div className={`min-h-screen bg-theme-bg font-sans flex flex-col text-theme-text ${isDarkMode ? 'dark' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
              <button onClick={() => navigateTo('home')} className={`text-[14px] font-bold transition-colors ${view === 'home' ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-text'}`}>{t.home[lang]}</button>
              <button onClick={() => navigateTo('products')} className={`text-[14px] font-bold transition-colors ${view === 'products' ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-text'}`}>{t.products[lang]}</button>
              <div className="relative group">
                <button 
                  className={`text-[14px] font-bold transition-colors text-theme-muted hover:text-theme-text flex items-center gap-1`}
                >
                  {t.categories[lang]} <ChevronDown size={14} />
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
            </nav>
          </div>

          <div className="flex items-center gap-[16px]">
            <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} className="p-[10px] bg-white border border-theme-border rounded-full hover:bg-theme-bg transition-colors shadow-sm flex items-center gap-1 font-bold text-[12px]">
              <Globe size={18} className="text-theme-text" /> 
              <span className="hidden md:inline">{lang === 'fr' ? 'AR' : 'FR'}</span>
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-[10px] bg-white border border-theme-border rounded-full hover:bg-theme-bg transition-colors shadow-sm">
              {isDarkMode ? <Sun size={20} className="text-theme-text" /> : <Moon size={20} className="text-theme-text" />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-[10px] bg-white border border-theme-border rounded-full hover:bg-theme-bg transition-colors shadow-sm">
              <ShoppingCart size={20} className="text-theme-text" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-[11px] font-bold w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-sm">{cart.reduce((s,i)=>s+i.quantity,0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1200px] mx-auto p-[20px] md:p-[30px] flex flex-col gap-[30px] items-start overflow-hidden">
        <div className="flex-grow w-full flex flex-col gap-[30px]">
          
          {/* HOME COMPONENT */}
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

              
              
              <div className="flex justify-between items-end mb-[10px]">
                <div>
                  <h2 className="text-[24px] font-serif font-bold text-theme-text">Certains de nos Produits</h2>
                  <p className="text-theme-muted text-[14px] mt-1">Découvrez notre collection</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[15px]">
                {products.slice(0, 12).map(p => <ProductCard key={`home-${p.id}`} product={p} onAdd={addToCart} />)}
              </div>
              
              <div className="flex justify-center mt-[10px]">
                <button 
                  onClick={() => navigateTo('products')}
                  className="bg-white border-2 border-theme-border text-theme-text font-bold py-[12px] px-[32px] rounded-[16px] hover:bg-theme-bg transition-colors shadow-sm text-[16px] flex items-center gap-2"
                >
                  Voir tous les produits <ArrowRight size={18} />
                </button>
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
                      
                      <form className="flex flex-col gap-4 mb-4" onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await signInWithEmailAndPassword(auth, email, password);
                        } catch (err: any) {
                          alert('Erreur: ' + err.message);
                        }
                      }}>
                        <div>
                          <label className="block text-[12px] font-bold text-theme-muted mb-1 uppercase tracking-wider">Email</label>
                          <input type="email" required className="w-full border border-theme-border rounded-[12px] p-[12px] bg-theme-bg focus:bg-white focus:border-theme-primary outline-none transition-all text-[15px]" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-theme-muted mb-1 uppercase tracking-wider">Mot de passe</label>
                          <input type="password" required className="w-full border border-theme-border rounded-[12px] p-[12px] bg-theme-bg focus:bg-white focus:border-theme-primary outline-none transition-all text-[15px]" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <button type="submit" className="w-full bg-theme-text text-theme-secondary font-bold py-[12px] rounded-[12px] hover:opacity-90 flex items-center justify-center gap-2 mt-2">
                          Se connecter
                        </button>
                      </form>

                      <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Ou</span>
                        </div>
                      </div>

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
                                      <td className="p-[15px] text-right flex gap-2 justify-end">
                                        <button 
                                          className="text-theme-muted hover:text-theme-primary bg-theme-bg hover:bg-theme-bg/80 p-[8px] rounded-[8px] transition-colors inline-flex border border-theme-border"
                                          onClick={() => {
                                            setNewProduct(p);
                                            setIsNewProductModalOpen(true);
                                          }}
                                        >
                                          <Pencil size={16} />
                                        </button>
                                        <button 
                                          className="text-theme-muted hover:text-red-600 bg-theme-bg hover:bg-red-50 p-[8px] rounded-[8px] transition-colors inline-flex border border-theme-border"
                                          onClick={async () => {
                                            if(confirm('Supprimer ce produit ?')) {
                                              try {
                                                const original = INITIAL_PRODUCTS.find(i => i.id === p.id);
                                                if (original) {
                                                  await setDoc(doc(db, 'products', p.id), { ...original, deleted: true });
                                                } else {
                                                  await deleteDoc(doc(db, 'products', p.id));
                                                }
                                                setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                                showToast("Produit supprimé");
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

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
        }}
      />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            key="mobile-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        {isMobileMenuOpen && (
          <motion.div 
            key="mobile-drawer"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[280px] bg-theme-bg z-50 shadow-2xl flex flex-col border-r border-theme-border md:hidden"
          >
              <div className="p-[20px] bg-theme-bg border-b border-theme-border flex justify-between items-center shrink-0">
                <span className="font-serif text-[18px] font-bold text-theme-text tracking-tight">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="hover:text-theme-primary bg-white p-1.5 rounded-full shadow-sm ring-1 ring-theme-border"><X size={16} /></button>
              </div>

              <div className="flex-grow overflow-y-auto p-[20px] flex flex-col gap-[16px]">
                <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className={`w-full text-left font-bold text-[16px] py-[10px] border-b border-theme-border/50 ${view === 'home' ? 'text-theme-primary' : 'text-theme-text'}`}>{t.home[lang]}</button>
                <button onClick={() => { setView('products'); setIsMobileMenuOpen(false); }} className={`w-full text-left font-bold text-[16px] py-[10px] border-b border-theme-border/50 ${view === 'products' ? 'text-theme-primary' : 'text-theme-text'}`}>{t.products[lang]}</button>
                
                <div className="mt-[10px]">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-theme-muted mb-[10px]">{t.categories[lang]}</h3>
                  <ul className="flex flex-col gap-[4px]">
                    {CATEGORIES_LIST.map(c => (
                      <li key={`mobile-cat-${c.id}`}>
                        <button onClick={() => { setCategory(c.id as Category); setView('products'); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center justify-between py-[8px] text-[14px]">
                          <span className={`${category === c.id && view === 'products' ? 'text-theme-primary font-bold' : 'text-theme-text font-medium'}`}>{c.fr}</span>
                          <span className="text-[11px] text-theme-muted">{c.ar}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewProductModalOpen && (
          <motion.div 
            key="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm shadow-2xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] w-full max-w-[500px] overflow-hidden"
            >
              <div className="p-[20px] border-b border-theme-border flex justify-between items-center bg-theme-bg">
                <h2 className="font-bold text-[18px]">Nouveau Produit</h2>
                <button onClick={() => setIsNewProductModalOpen(false)} className="p-1 hover:bg-white rounded-full transition-colors border border-transparent hover:border-theme-border shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleNewProductSubmit} className="p-[24px] flex flex-col gap-4 text-[14px]">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider">Nom (Français) *</label>
                    <button 
                      type="button" 
                      onClick={() => generateMetadataForProduct(newProduct.nameFr || '')} 
                      disabled={isGeneratingMetadata || !newProduct.nameFr}
                      className="text-[12px] text-theme-primary font-bold flex items-center gap-1 disabled:opacity-50 hover:underline"
                    >
                      {isGeneratingMetadata ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} IA Auto-complet
                    </button>
                  </div>
                  <input required className="w-full border border-theme-border rounded-[12px] p-[12px] bg-theme-bg focus:bg-white outline-none transition-colors" value={newProduct.nameFr || ''} onChange={e => setNewProduct({...newProduct, nameFr: e.target.value})} onBlur={() => { if(newProduct.nameFr && !newProduct.nameAr && !newProduct.descriptionFr) generateMetadataForProduct(newProduct.nameFr); }} />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-theme-muted mb-1 uppercase tracking-wider">Nom (Arabe) *</label>
                  <input required dir="rtl" className="w-full border border-theme-border rounded-[12px] p-[12px] bg-theme-bg focus:bg-white outline-none transition-colors" value={newProduct.nameAr || ''} onChange={e => setNewProduct({...newProduct, nameAr: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-theme-muted mb-1 uppercase tracking-wider">Prix (DA) *</label>
                    <input required type="number" min="0" className="w-full border border-theme-border rounded-[12px] p-[12px] bg-theme-bg focus:bg-white outline-none transition-colors" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-theme-muted mb-1 uppercase tracking-wider">Catégorie *</label>
                    <select required className="w-full border border-theme-border rounded-[12px] p-[12px] bg-theme-bg focus:bg-white outline-none transition-colors" value={newProduct.category || 'divers'} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}>
                      {CATEGORIES_LIST.map(c => <option key={c.id} value={c.id}>{c.fr}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-theme-muted mb-1 uppercase tracking-wider">Description (Français)</label>
                  <textarea rows={2} className="w-full border border-theme-border rounded-[12px] p-[12px] bg-theme-bg focus:bg-white outline-none transition-colors resize-none" value={newProduct.descriptionFr || ''} onChange={e => setNewProduct({...newProduct, descriptionFr: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-theme-muted mb-1 uppercase tracking-wider">Description (Arabe)</label>
                  <textarea rows={2} dir="rtl" className="w-full border border-theme-border rounded-[12px] p-[12px] bg-theme-bg focus:bg-white outline-none transition-colors resize-none" value={newProduct.descriptionAr || ''} onChange={e => setNewProduct({...newProduct, descriptionAr: e.target.value})} />
                </div>
                <div className="bg-theme-bg border border-theme-border border-dashed p-[16px] rounded-[12px]">
                  <label className="block text-[12px] font-bold text-theme-text mb-1 flex items-center justify-between">
                    Image
                    <span className="text-[10px] bg-[#f1c40f] text-black px-2 py-0.5 rounded-full">Fond effacé automatiquement</span>
                  </label>
                  <input type="file" accept="image/*" disabled={isProcessingImage} className="w-full text-[13px] mt-2 mb-1" onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        setIsProcessingImage(true);
                        const img = await processImage(e.target.files[0]);
                        setNewProduct({...newProduct, image: img});
                      } catch(err) {
                        alert("Erreur");
                      } finally {
                        setIsProcessingImage(false);
                      }
                    }
                  }} />
                  {isProcessingImage && <p className="text-[12px] text-theme-primary flex items-center gap-1 font-bold mt-2"><Loader2 size={12} className="animate-spin" /> Traitement de l'image en cours...</p>}
                  {newProduct.image && !isProcessingImage && <p className="text-[12px] text-green-600 flex items-center gap-1 font-bold mt-2"><CheckCircle size={12} /> Prête</p>}
                </div>
                <div className="mt-[16px] flex justify-end">
                  <button disabled={isSavingProduct} type="submit" className="bg-theme-text text-theme-secondary font-bold py-[12px] px-[24px] rounded-[10px] hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-sm">
                    {isSavingProduct ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-[80px] left-1/2 z-[100] bg-theme-text text-theme-secondary px-[24px] py-[12px] rounded-[12px] shadow-lg flex items-center gap-[12px] font-bold text-[14px]"
          >
            <CheckCircle size={18} className="text-green-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
