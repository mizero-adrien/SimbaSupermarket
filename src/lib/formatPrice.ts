export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-RW').format(price) + ' RWF';
}
