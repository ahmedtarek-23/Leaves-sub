/**
 * Format utilities that are safe for SSR (Server-Side Rendering)
 * These functions ensure consistent formatting between server and client
 */

/**
 * Format a date to YYYY-MM-DD format (consistent across server and client)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a date to a readable format (MM/DD/YYYY) - consistent across server and client
 */
export function formatDateReadable(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${month}/${day}/${year}`;
}

/**
 * Format a number with commas (consistent across server and client)
 * Example: 1000000 -> "1,000,000"
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return '0';
  
  // Convert to string and add commas
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format currency (consistent across server and client)
 */
export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  const formatted = formatNumber(amount);
  return `${formatted} ${currency}`;
}

