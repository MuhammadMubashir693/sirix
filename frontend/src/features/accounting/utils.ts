export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

/** `<input type="date">` and `type="datetime-local"` need local-time ISO fragments. */
export function toDateInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function todayInputValue() {
  return toDateInputValue(new Date().toISOString());
}
