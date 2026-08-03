/** Shared input sanitising for anything a customer types. */
export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "") // strip HTML/script tags
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, " ") // strip control characters
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
