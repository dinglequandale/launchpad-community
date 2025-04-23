import { algoliaClient } from '../typesense/typesenseClient'

const searchDocuments = async (collectionName, searchText, tenantId) => {
  try {
    // let searchParameters;

    // if (collectionName === 'opportunities') {
    //   searchParameters = {
    //     q: searchText,
    //     query_by: 'organizationName,organizationType,organizationMission,applicantPosition,organizationHostCompany',
    //     num_typos: 1, // Allow up to 1 typo
    //     filter_by: `tenantId:=${tenantId}`
    //   };
    // } else {
    //   searchParameters = {
    //     q: searchText,
    //     query_by: 'userName,companyName',
    //     num_typos: 1, // Allow up to 1 typo
    //     filter_by: `tenantId:=${tenantId}`
    //   };
    // }

    // const searchResults = await client
    // .collections(collectionName)
    // .documents()
    // .search(searchParameters);

    // const matches = searchResults.hits.map(hit => hit.document);
    const {results} = await algoliaClient.search({
              requests: [{ indexName: collectionName, query: searchText, hitsPerPage: 10 }],
            });
    const matches = results[0].hits;
    return matches;
  } catch (error) {
    console.error('Error searching algolia: ', error);
  }
};

export { searchDocuments };