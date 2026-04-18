import { Product } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop';

// Deterministic shuffle using a simple hash-based seed
export function deterministicShuffle<T>(arr: T[], seed: number = 42): T[] {
  const shuffled = [...arr];
  let random = seed;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    random = (random * 9301 + 49297) % 233280;
    const j = Math.floor((random / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

const categoryImages: Record<string, string> = {
  'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop',
  'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop',
  'Snacks': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=200&fit=crop',
  'Grains & Cereals': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
  'Household': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
  'Personal Care': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop',
  'Fruits & Vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
  'Meat & Fish': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
  'Baby Products': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=200&fit=crop',
};

export const categoryEmojis: Record<string, string> = {
  'Beverages': '🥤',
  'Dairy': '🥛',
  'Snacks': '🍿',
  'Grains & Cereals': '🌾',
  'Household': '🏠',
  'Personal Care': '🧴',
  'Fruits & Vegetables': '🥦',
  'Meat & Fish': '🥩',
  'Baby Products': '👶',
};

export function getProductImage(product: Product): string {
  if (product.image && product.image.startsWith('http')) {
    return product.image;
  }
  return categoryImages[product.category] ?? FALLBACK_IMAGE;
}

export function getCategoryImage(category: string): string {
  return categoryImages[category] ?? FALLBACK_IMAGE;
}

export function getCategories(products: Product[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const p of products) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}
