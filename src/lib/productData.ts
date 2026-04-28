import productsSeed from '../../public/simba_products.json';
import { Product } from '@/types';

const PRODUCTS_STORAGE_KEY = 'simba_products_master';
// Support new structure: { store: {...}, products: [...] }
const seedProducts = Array.isArray(productsSeed)
  ? (productsSeed as Product[])
  : (productsSeed.products as Product[]);

function mergeProducts(stored: Product[]): Product[] {
  const merged = new Map<string, Product>();

  for (const product of seedProducts) {
    merged.set(String(product.id), product);
  }

  for (const product of stored) {
    merged.set(String(product.id), product);
  }

  return Array.from(merged.values());
}

export function getMasterProducts(): Product[] {
  if (typeof window === 'undefined') return seedProducts;

  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const stored: Product[] = raw ? JSON.parse(raw) : [];

    if (stored.length === 0) {
      return seedProducts;
    }

    if (stored.length < seedProducts.length) {
      const merged = mergeProducts(stored);
      saveMasterProducts(merged);
      return merged;
    }

    return stored;
  } catch {
    return seedProducts;
  }
}

export function saveMasterProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

export function createProduct(input: Omit<Product, 'id'>) {
  const all = getMasterProducts();
  const product: Product = {
    id: `prd-${Date.now()}`,
    name: input.name,
    category: input.category,
    price: input.price,
    image: input.image,
    description: input.description,
  };
  const updated = [product, ...all];
  saveMasterProducts(updated);
  return product;
}

export function updateProduct(productId: string | number, patch: Partial<Omit<Product, 'id'>>) {
  const all = getMasterProducts();
  const updated = all.map(p => (String(p.id) === String(productId) ? { ...p, ...patch } : p));
  saveMasterProducts(updated);
  return updated;
}

export function deleteProduct(productId: string | number) {
  const updated = getMasterProducts().filter(p => String(p.id) !== String(productId));
  saveMasterProducts(updated);
  return updated;
}

export function getProductCategories(products: Product[]) {
  const counts = new Map<string, number>();
  for (const p of products) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
}

export function renameCategory(from: string, to: string) {
  const updated = getMasterProducts().map(p => (p.category === from ? { ...p, category: to } : p));
  saveMasterProducts(updated);
  return updated;
}

export function deleteCategory(category: string) {
  const updated = getMasterProducts().filter(p => p.category !== category);
  saveMasterProducts(updated);
  return updated;
}
