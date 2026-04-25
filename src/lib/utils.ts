import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: any) {
  let numericPrice = 0;
  if (typeof price === 'number') {
    numericPrice = price;
  } else if (typeof price === 'string') {
    numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
  }
  
  if (isNaN(numericPrice)) numericPrice = 0;

  return new Intl.NumberFormat('fr-GA', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(numericPrice);
}

export function parseRobustDate(dateVal: any): Date | null {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal;
  if (dateVal.seconds) return new Date(dateVal.seconds * 1000);
  if (typeof dateVal.toDate === 'function') return dateVal.toDate();
  
  if (typeof dateVal === 'string') {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
    
    // Parse French format: "24 avril 2026 à 14:35:55"
    try {
      const months: Record<string, number> = {
        'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
        'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
      };
      const cleaned = dateVal.toLowerCase().replace('à', '').replace(/  +/g, ' ').trim();
      const parts = cleaned.split(' ');
      if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const month = months[parts[1].toLowerCase()];
        const year = parseInt(parts[2]);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          const result = new Date(year, month, day);
          if (parts[3] && parts[3].includes(':')) {
            const timeParts = parts[3].split(':');
            result.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2] || '0'));
          }
          return result;
        }
      }
    } catch (e) {
      console.warn("Failed to parse French date:", dateVal);
    }
  }
  return null;
}
