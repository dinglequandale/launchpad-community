/**
 * In-house search index for Firestore.
 *
 * Each searchable document gets a `searchTokens` array containing every prefix
 * (1..MAX_PREFIX chars) of every word in its searchable fields. A search for
 * "rice comp" then becomes:
 *
 *   where('searchTokens', 'array-contains', 'comp')   // most selective word
 *   + client-side check that 'rice' is also in searchTokens
 *
 * This replaces Algolia/Typesense: no extra service, no public read key, and
 * every read still goes through Firestore security rules.
 *
 * KEEP IN SYNC with src/utils/searchTokens.js (the client tokenizes queries the
 * same way).
 */

const MAX_PREFIX = 20;
const MAX_TOKENS = 800;

function normalize(text) {
    return String(text)
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function words(text) {
    const n = normalize(text);
    return n ? n.split(' ') : [];
}

/** Flatten strings, numbers, arrays and {label|value|skillDescription|name} objects into text. */
function collectText(value, out) {
    if (value === null || value === undefined) return out;
    if (typeof value === 'string' || typeof value === 'number') {
        out.push(String(value));
    } else if (Array.isArray(value)) {
        value.forEach((v) => collectText(v, out));
    } else if (typeof value === 'object') {
        ['label', 'value', 'skillDescription', 'skillCategory', 'name'].forEach((k) => {
            if (typeof value[k] === 'string') out.push(value[k]);
        });
    }
    return out;
}

function buildSearchTokens(data, fields) {
    const tokens = new Set();
    for (const field of fields) {
        for (const text of collectText(data[field], [])) {
            for (const word of words(text)) {
                const max = Math.min(word.length, MAX_PREFIX);
                for (let i = 1; i <= max; i++) {
                    tokens.add(word.slice(0, i));
                    if (tokens.size >= MAX_TOKENS) return [...tokens].sort();
                }
            }
        }
    }
    return [...tokens].sort();
}

const USER_SEARCH_FIELDS = [
    'userName',
    'userType',
    'schoolAttending',
    'collegeAttending',
    'companyName',
    'industryPosition',
    'schoolRole',
    'areasOfInterest',
    'userSkills',
];

const OPPORTUNITY_SEARCH_FIELDS = [
    'title',
    'organizationName',
    'organizationType',
    'organizationHostCompany',
    'applicantPosition',
    'organizationTags',
    'location',
    'organizationLocation',
];

function sameTokens(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

module.exports = {
    MAX_PREFIX,
    normalize,
    words,
    buildSearchTokens,
    sameTokens,
    USER_SEARCH_FIELDS,
    OPPORTUNITY_SEARCH_FIELDS,
};
