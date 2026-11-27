/**
 * Client half of the in-house search index. Must tokenize exactly like
 * functions/utils/searchTokens.js, which builds each document's `searchTokens`.
 */
export const MAX_PREFIX = 20;

export function normalizeSearchText(text) {
  return String(text ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Query words, truncated to the indexed prefix length, de-duplicated, longest first. */
export function queryTokens(text) {
  const n = normalizeSearchText(text);
  if (!n) return [];
  const unique = [...new Set(n.split(' ').map((w) => w.slice(0, MAX_PREFIX)))];
  return unique.sort((a, b) => b.length - a.length);
}
