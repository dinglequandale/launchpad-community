import Typesense from "typesense";
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: cert('launchpad-e7e5a-firebase-adminsdk-6d3sx-8c95b99a1c.json')
});
const db = getFirestore();

const readFirestoreData = async (collectionName, tenantId = null) => {
  try {
    let docsRef;
    if (tenantId) {
      docsRef = db.collection('tenants').doc(tenantId).collection(collectionName);
    } else {
      docsRef = db.collection(collectionName);
    }

    const snapshot = await docsRef.get();
    const data = snapshot.docs.map(doc => {
      const docData = { id: doc.id, ...doc.data() };

      if (collectionName === "opportunities") {
        docData.organizationHostCompany = docData.organizationHostCompany || "";
        docData.applicantPosition = docData.applicantPosition || "";
        docData.organizationName = docData.organizationName || "";
        docData.organizationMission = docData.organizationMission || "";
      } else if (collectionName === "users") {
        docData.companyName = docData.companyName || "";
      }
      return docData;
    });

    return data;
  } catch (error) {
    console.error('Error reading Firestore data: ', error);
    return [];
  }
};

(async () => {
  const TYPESENSE_CONFIG = {
    nodes: [
      {
        host: '20.3.232.3',
        port: "8108",
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
      metadata: { type: "shared" } // Shared collection among all tenants
    },
    {
      name: "users",
      fields: [
        {
          name: "userName",
          type: "string",
          facet: false,
        },
        {
          name: "companyName",
          type: "string",
          facet: false
        },
        {
          name: "tenantId", // Add tenant facet for metadata filtering
          type: "string",
          facet: true,
        }
      ],
      metadata: { type: "tenant_specific" } // Metadata to indicate this is tenant-specific
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
        },
        {
          name: "organizationHostCompany",
          type: "string",
          facet: false,
        },
        {
          name: "applicantPosition",
          type: "string",
          facet: false,
        },
        {
          name: "tenantId",
          type: "string",
          facet: true,
        }
      ],
      metadata: { type: "tenant_specific" }
    }
  ];

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

  // Fetch the tenants (should only be "awty" for now)
  const tenantsSnapshot = await db.collection('tenants').get();
  const tenantIds = tenantsSnapshot.docs.map(doc => doc.id);

  // Upload users & opportunities: tenant specific data
  for (const tenantId of tenantIds) {
    for (const collectionName of ["users", "opportunities"]) {
      try {
        const collectionData = await readFirestoreData(collectionName, tenantId);
        const dataWithTenant = collectionData.map(doc => ({
          ...doc,
          tenantId
        }));

        const returnData = await typesense
          .collections(collectionName)
          .documents()
          .import(dataWithTenant, { action: 'upsert' });
    
        console.log(`${collectionName} data imported to ${tenantId}:`, returnData);
      } catch (err) {
        console.error(`Error importing ${collectionName} data to ${tenantIds}:`, err);
      }
    }
  }

  // Upload colleges: shared data
  try {
    const collectionData = await readFirestoreData("colleges", null);
    const returnData = await typesense
      .collections("colleges")
      .documents()
      .import(collectionData, { action: 'upsert' });

    console.log(`Data imported to colleges collection:`, returnData);
  } catch (err) {
    console.error(`Error importing data to colleges collection:`, err);
  }
})();