import { randomInt } from 'crypto';

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // 6-digit random number (000001–999999)
  const random = String(randomInt(1, 999999)).padStart(6, '0');

  return `ORD-${year}${month}${day}-${random}`;
}
