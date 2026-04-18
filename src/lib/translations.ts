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
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}

export default translations;
