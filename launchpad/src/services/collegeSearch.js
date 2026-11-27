/**
 * Local college search (replaces the Algolia `colleges` index, which no longer exists).
 *
 * Data: src/data/colleges.json, built from the U.S. Department of Education IPEDS
 * institutional directory (HD2024, public domain): active, degree-granting
 * institutions as [officialName, stateCode, aliases?]. Official names match what
 * the old Algolia index stored (e.g. "The University of Texas at Austin").
 * The ~190 KB file is loaded lazily, the first time a college picker needs it.
 */
import { normalizeSearchText } from '../utils/searchTokens';

let collegesPromise = null;

// Shown before the user types anything.
const DEFAULT_COLLEGES = [
  'University of Houston',
  'Rice University',
  'The University of Texas at Austin',
  'Texas A&M University-College Station',
  'Houston Community College',
  'University of St Thomas',
  'Texas Southern University',
  'Baylor University',
];

function loadColleges() {
  if (!collegesPromise) {
    collegesPromise = import('../data/colleges.json')
      .then((mod) => (mod.default || mod).map(([name, state, aliases = '']) => ({
        name,
        state,
        haystack: normalizeSearchText(`${name} ${aliases}`),
        normName: normalizeSearchText(name).replace(/^the /, ''),
      })))
      .catch((error) => {
        collegesPromise = null; // allow a retry
        throw error;
      });
  }
  return collegesPromise;
}

/** Returns up to `max` official college names matching `searchQuery`, best first. */
export async function searchColleges(searchQuery = '', max = 8) {
  const colleges = await loadColleges();
  const q = normalizeSearchText(searchQuery).replace(/^the /, '');
  if (!q) {
    const known = new Set(colleges.map((c) => c.name));
    return DEFAULT_COLLEGES.filter((n) => known.has(n)).slice(0, max);
  }
  const qWords = q.split(' ');

  const scored = [];
  for (const c of colleges) {
    let score;
    if (c.normName === q) score = 0;
    else if (c.normName.startsWith(q)) score = 1;
    else if (c.haystack.split(' ').some((w) => w.startsWith(qWords[0]))
      && qWords.every((w) => c.haystack.includes(w))) score = 2;
    else if (c.haystack.includes(q)) score = 3;
    else continue;
    // Prefer Texas schools on ties (Houston-based community), then shorter names.
    scored.push([score, c.state === 'TX' ? 0 : 1, c.name.length, c.name]);
  }
  scored.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  return scored.slice(0, max).map((s) => s[3]);
}
