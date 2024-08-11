import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [
    {
      host: 'localhost', // Typesense server host
      port: 8108, // Typesense server port
      protocol: 'http', // 'http' or 'https'
    },
  ],
  apiKey: 'xyz', // Replace with your actual Typesense API key
  connectionTimeoutSeconds: 2,
});

const searchDocuments = async (collectionName, searchText) => {
  try {
    if (collectionName === 'opportunities') {
      const searchParameters = {
        q: searchText,
        query_by: 'organizationName,organizationType,organizationMission', // Search across multiple fields
      };
      
      const searchResults = await client
        .collections(collectionName)
        .documents()
        .search(searchParameters);

      const matches = searchResults.hits.map(hit => hit.document);

      return matches;
    } else {
      const searchParameters = {
        q: searchText,
        query_by: 'userName', // Search by userName
      };

      const searchResults = await client
        .collections(collectionName)
        .documents()
        .search(searchParameters);

      const matches = searchResults.hits.map(hit => hit.document);

      console.log(matches);
      return matches;
    }
  } catch (error) {
    console.error('Error searching Typesense: ', error);
  }
};

export { searchDocuments };