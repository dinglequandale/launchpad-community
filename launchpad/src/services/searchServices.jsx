import client from '../typesense/typesenseClient'

const searchDocuments = async (collectionName, searchText) => {
  try {
    let searchParameters;

    if (collectionName === 'opportunities') {
      searchParameters = {
        q: searchText,
        query_by: 'organizationName,organizationType,organizationMission',
        num_typos: 1, // Allow up to 1 typo
      };
    } else {
      searchParameters = {
        q: searchText,
        query_by: 'userName',
        num_typos: 1, // Allow up to 1 typo
      };
    }

    const searchResults = await client
    .collections(collectionName)
    .documents()
    .search(searchParameters);

    const matches = searchResults.hits.map(hit => hit.document);

    console.log(matches);
    return matches;
  } catch (error) {
    console.error('Error searching Typesense: ', error);
  }
};

export { searchDocuments };