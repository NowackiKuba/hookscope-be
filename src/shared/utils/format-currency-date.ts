/** Format amount in zł as Polish currency e.g. "230,00 zł" */
export function formatCurrencyZl(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')} zł`;
}

/** Format date in Polish e.g. "10 marca 2026" */
export function formatPolishDate(date: Date): string {
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Format date with time from settings e.g. "10 marca 2026, 14:00" */
export function formatPolishDateWithTime(
  date: Date,
  timeFromSettings: string | undefined,
): string {
  const dateStr = formatPolishDate(date);
  if (timeFromSettings?.trim()) {
    return `${dateStr}, ${timeFromSettings.trim()}`;
  }
  return dateStr;
}
