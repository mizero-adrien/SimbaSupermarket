import { Language } from '@/types';

const translations: Record<string, Record<Language, string>> = {
  'Shop Now': { en: 'Shop Now', fr: 'Acheter', rw: 'Gura Ubu' },
  'Add to Cart': { en: 'Add to Cart', fr: 'Ajouter au panier', rw: 'Shyira mu Gitebo' },
  'Cart': { en: 'Cart', fr: 'Panier', rw: 'Gitebo' },
  'Checkout': { en: 'Checkout', fr: 'Paiement', rw: 'Kwishyura' },
  'Search products...': { en: 'Search products...', fr: 'Rechercher...', rw: 'Shakisha...' },
  'Home': { en: 'Home', fr: 'Accueil', rw: 'Ahabanza' },
  'Products': { en: 'Products', fr: 'Produits', rw: 'Ibicuruzwa' },
  'Categories': { en: 'Categories', fr: 'Catégories', rw: 'Ibyiciro' },
  'Price': { en: 'Price', fr: 'Prix', rw: 'Igiciro' },
  'Filter': { en: 'Filter', fr: 'Filtrer', rw: 'Shungura' },
  'Total': { en: 'Total', fr: 'Total', rw: 'Igiteranyo' },
  'Delivery': { en: 'Delivery', fr: 'Livraison', rw: 'Gutanga' },
  'Free': { en: 'Free', fr: 'Gratuit', rw: 'Ubuntu' },
  'Remove': { en: 'Remove', fr: 'Supprimer', rw: 'Kuvaho' },
  'Continue Shopping': { en: 'Continue Shopping', fr: 'Continuer', rw: 'Komeza Kugura' },
  'Browse Categories': { en: 'Browse Categories', fr: 'Voir Catégories', rw: 'Reba Ibyiciro' },
  'All Products': { en: 'All Products', fr: 'Tous les Produits', rw: 'Ibicuruzwa Byose' },
  'Shop by Category': { en: 'Shop by Category', fr: 'Par Catégorie', rw: 'Gura mu Byiciro' },
  'Featured Products': { en: 'Featured Products', fr: 'Produits Vedettes', rw: 'Ibicuruzwa Byihariye' },
  'Your Cart': { en: 'Your Cart', fr: 'Votre Panier', rw: 'Igitebo Cyawe' },
  'Place Order': { en: 'Place Order', fr: 'Passer Commande', rw: 'Ohereza Itegeko' },
  'Order Summary': { en: 'Order Summary', fr: 'Résumé de Commande', rw: 'Incamake' },
  'In Stock': { en: 'In Stock', fr: 'En Stock', rw: 'Biraboneka' },
  'Proceed to Checkout': { en: 'Proceed to Checkout', fr: 'Payer', rw: 'Kwishyura' },
  'About Us': { en: 'About Us', fr: 'À propos', rw: 'Abo Turi Bo' },
  'Branches': { en: 'Branches', fr: 'Succursales', rw: 'Amashami' },
  'Login': { en: 'Login', fr: 'Connexion', rw: 'Injira' },
  'Sign Up': { en: 'Sign Up', fr: "S'inscrire", rw: 'Iyandikishe' },
  'Dashboard': { en: 'Dashboard', fr: 'Tableau de bord', rw: 'Igenzura' },
  'Logout': { en: 'Logout', fr: 'Déconnexion', rw: 'Sohoka' },
  'Language': { en: 'Language', fr: 'Langue', rw: 'Ururimi' },
  'All Categories': { en: 'All Categories', fr: 'Toutes les catégories', rw: 'Ibyiciro byose' },
  'View All': { en: 'View All', fr: 'Voir tout', rw: 'Reba byose' },
  'No products found': { en: 'No products found', fr: 'Aucun produit trouvé', rw: 'Nta bicuruzwa byabonetse' },
  'Try adjusting your filters or search terms.': {
    en: 'Try adjusting your filters or search terms.',
    fr: 'Essayez de modifier vos filtres ou mots-clés.',
    rw: 'Gerageza guhindura filtres cyangwa amagambo washakishije.',
  },
  'Clear Filters': { en: 'Clear Filters', fr: 'Effacer les filtres', rw: 'Kuraho filtres' },
  'No results found': { en: 'No results found', fr: 'Aucun résultat trouvé', rw: 'Nta bisubizo byabonetse' },
  'Popular Categories': { en: 'Popular Categories', fr: 'Catégories populaires', rw: 'Ibyiciro bikunzwe' },
  'Search': { en: 'Search', fr: 'Rechercher', rw: 'Shakisha' },
  'Profile': { en: 'Profile', fr: 'Profil', rw: 'Umwirondoro' },
  'Quick View': { en: 'Quick View', fr: 'Aperçu rapide', rw: 'Reba vuba' },
  'Out of stock': { en: 'Out of stock', fr: 'Rupture de stock', rw: 'Ntibikiriho' },
  'View full details': { en: 'View full details', fr: 'Voir les détails', rw: 'Reba ibisobanuro byose' },
  'products': { en: 'products', fr: 'produits', rw: 'ibicuruzwa' },
};

const categoryTranslations: Record<string, Record<Language, string>> = {
  'Beverages': { en: 'Beverages', fr: 'Boissons', rw: 'Ibinyobwa' },
  'Dairy': { en: 'Dairy', fr: 'Produits laitiers', rw: 'Ibikomoka ku mata' },
  'Snacks': { en: 'Snacks', fr: 'Snacks', rw: 'Ibiryo byoroheje' },
  'Grains & Cereals': { en: 'Grains & Cereals', fr: 'Grains et céréales', rw: 'Ibinyampeke' },
  'Household': { en: 'Household', fr: 'Maison', rw: 'Ibikoresho byo mu rugo' },
  'Personal Care': { en: 'Personal Care', fr: 'Soins personnels', rw: 'Isuku y\'umuntu' },
  'Fruits & Vegetables': { en: 'Fruits & Vegetables', fr: 'Fruits et légumes', rw: 'Imbuto n\'imboga' },
  'Meat & Fish': { en: 'Meat & Fish', fr: 'Viande et poisson', rw: 'Inyama n\'ifi' },
  'Baby Products': { en: 'Baby Products', fr: 'Produits pour bébé', rw: 'Ibicuruzwa by\'abana' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}

export function translateCategory(category: string, lang: Language): string {
  return categoryTranslations[category]?.[lang] ?? category;
}

export default translations;
