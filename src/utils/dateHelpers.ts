/**
 * Date helper utilities for law firm management
 */

export function getDaysRemaining(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  // Current simulated base date: 2026-10-13 (from metadata) or real current date
  const now = new Date();
  const target = new Date(targetDateStr);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(targetDateStr: string, alertDays = 30): boolean {
  const remaining = getDaysRemaining(targetDateStr);
  return remaining >= 0 && remaining <= alertDays;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' ج.م';
}

export function formatDateArabic(dateStr: string): string {
  if (!dateStr) return 'غير محدد';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
