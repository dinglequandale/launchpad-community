import Typesense from 'typesense';

const client = new Typesense.Client({
    nodes: [
      {
        host: 'launchpad-typesense.westus2.cloudapp.azure.com',
        port: '443',
        protocol: 'https', 
      },
    ],
    apiKey: 'xyz', 
    connectionTimeoutSeconds: 2,
});

const updateTypesense = async (collectionName, documentId, data, tenantId) => {
  try {
      await client.collections(collectionName).documents().upsert({
          id: documentId,
          tenantId,
          ...data,
      });
      console.log(`Typesense: Document with ID ${documentId} in collection ${collectionName} updated.`);
  } catch (error) {
      console.error(`Typesense: Failed to update document in ${collectionName}: `, error);
  }
};

const deleteFromTypesense = async (collectionName, documentId) => {
  try {
      await client.collections(collectionName).documents(documentId).delete();
      console.log(`Typesense: Document with ID ${documentId} deleted from collection ${collectionName}.`);
  } catch (error) {
      console.error(`Typesense: Failed to delete document from ${collectionName}: `, error);
  }
};

export { client, updateTypesense, deleteFromTypesense };