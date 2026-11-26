/**
 * Normalise a user-supplied link into a safe external http(s) URL.
 *
 * React 18 still executes `javascript:` URLs placed in `href` (it only logs a
 * warning), and `window.open('javascript:...')` is equally dangerous. Opportunity
 * "apply"/"learn more" links and profile links are written by other users, so they
 * must never reach an href or window.open without going through this.
 *
 * - "example.com"          -> "https://example.com/"
 * - "http(s)://..."        -> unchanged (normalised)
 * - "javascript:...", "data:...", anything unparsable -> "" (caller should hide the link)
 */
export function toSafeHttpUrl(value) {
  if (typeof value !== 'string') return '';
  let candidate = value.trim();
  if (!candidate) return '';

  // Bare domains / paths: assume https. A scheme is "letters followed by a colon".
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, '')}`;
  }

  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

/** Open a user-supplied link in a new tab, refusing anything that isn't http(s). */
export function openExternalUrl(value) {
  const url = toSafeHttpUrl(value);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return Boolean(url);
}

/** Build a mailto: link from a user-supplied address, or "" if it isn't one. */
export function toSafeMailto(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim();
  return /^[^\s@<>"'/:]+@[^\s@<>"'/:]+\.[^\s@<>"'/:]+$/.test(email) ? `mailto:${email}` : '';
}
