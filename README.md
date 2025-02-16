# launchpad-platform
A platform that revolutionizes high schoolers' access to valuable connections and on-site job experience

# Run locally
First, `cd` into `launchpad/`. This will be the working directory from now on. Install npm packages:

`npm install`

Then, obtain a Firebase Admin SDK private key (should be a JSON file). This is used to populate the typesense server with the information from Firestore. **Only do this once:**


`npm run populate`

This populates the typesense server on Azure.

Finally:

`npm run dev`

# Run typesense server on Azure

`ssh launchpad@20.3.232.3`

password: Spacestation979!

```
sudo docker run -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt -v /tmp:/data typesense/typesense:27.1 --data-dir /data --api-key=xyz --enable-cors --cors-domains http://localhost:3001,https://awty.launchpadhouston.com --ssl-certificate /etc/letsencrypt/live/launchpad-typesense.westus2.cloudapp.azure.com/fullchain.pem --ssl-certificate-key /etc/letsencrypt/live/launchpad-typesense.westus2.cloudapp.azure.com/privkey.pem --api-port 443
```

Run unsecurely via http (needed for populating)

`sudo docker run -p 8108:8108 -v/tmp:/data typesense/typesense:27.1 --data-dir /data --api-key=xyz`

Deleting a collection to start again

`curl -H "X-TYPESENSE-API-KEY: xyz" -X DELETE "http://20.3.232.3:8108/collections/users"``

