import Typesense from "typesense";
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: cert('launchpad-e7e5a-firebase-adminsdk-6d3sx-8c95b99a1c.json')
});
const db = getFirestore();

const readFirestoreData = async (collectionName) => {
  try {
    const docsRef = db.collection(collectionName); // Access collection using Admin SDK
    const snapshot = await docsRef.get(); // Fetch documents using Admin SDK

    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data; // Return the array directly
  } catch (error) {
    console.error('Error reading Firestore data: ', error);
    return [];
  }
};

(async () => {
  const TYPESENSE_CONFIG = {
    nodes: [
      {
        host: 'localhost',
        port: 8108,
        protocol: 'http',
      },
    ],
    apiKey: 'xyz',
  };

  const typesense = new Typesense.Client(TYPESENSE_CONFIG);

  const schemas = [
    {
      name: "colleges",
      fields: [
        {
          name: "label",
          type: "string",
          facet: false,
        }
      ],
      default_sorting_field: "label",
    },
    {
      name: "users",
      fields: [
        {
          name: "userName",
          type: "string",
          facet: false,
        }
      ],
    },
    {
      name: "opportunities",
      fields: [
        {
          name: "organizationName",
          type: "string",
          facet: false,
        },
        {
          name: "organizationType",
          type: "string",
          facet: false,
        },
        {
          name: "organizationMission",
          type: "string",
          facet: false,
        }
      ],
    },
  ]


  // Loop over schemas to create collections
  for (const schema of schemas) {
    try {
      await typesense.collections().create(schema);
      console.log(`Collection ${schema.name} created`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Collection ${schema.name} already exists`);
      } else {
        console.error(`Error creating collection ${schema.name}:`, error);
        return;
      }
    }
  }

  // Loop over the collection names to read data from Firestore and import it to Typesense
  const collectionNames = ["colleges", "users", "opportunities"];

  for (const collectionName of collectionNames) {
    try {
      const collectionData = await readFirestoreData(collectionName);
      const returnData = await typesense
        .collections(collectionName)
        .documents()
        .import(collectionData, { action: 'upsert' });

      console.log(`Data imported to ${collectionName} collection:`, returnData);
    } catch (err) {
      console.error(`Error importing data to ${collectionName} collection:`, err);
    }
  }
})();