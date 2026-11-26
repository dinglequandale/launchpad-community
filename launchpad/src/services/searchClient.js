import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Algolia search-only client. VITE_ALGOLIA_SEARCH_KEY must be a *search-only* API key
// (it ships to every browser). Never put an admin/write key here.
export const algoliaClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);
