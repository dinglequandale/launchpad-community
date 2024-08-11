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

  const schema = {
    name: "colleges",
    fields: [
      {
        name: "label",
        type: "string",
        facet: false,
      }
    ],
    default_sorting_field: "label",
  };

  // Check if collection already exists and handle it
  try {
    await typesense.collections().create(schema);
    console.log('Collection created');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Collection already exists');
    } else {
      console.error('Error creating collection: ', error);
      return;
    }
  }

  const collegeData = await readFirestoreData("colleges");

  try {
    const returnData = await typesense
      .collections("colleges")
      .documents()
      .import(collegeData, { action: 'upsert' }); // Use upsert to update existing records

    console.log("Return data: ", returnData);
  } catch (err) {
    console.error('Error importing data: ', err);
  }
})();