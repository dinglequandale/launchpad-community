# launchpad-platform
A platform that revolutionizes high schoolers' access to valuable connections and on-site job experience

# How to run
Make sure you have `docker` installed. 

# Run locally
First, `cd` into `launchpad/`. This will be the working directory from now on. Install npm packages:

`npm install`

Then, obtain a Firebase Admin SDK private key (should be a JSON file). This is used to populate the typesense server with the information from Firestore. **Only do this once:**

```
docker pull typesense/typesense:26.0
mkdir typesense-server-data
npm run start-typesense-server
npm run populate
```

This starts the typesense and stores all the compressed/serialized data in `typesense-server-data/` folder you created. Right now we are running the server locally (which is free) on port 8108.

Finally:

`npm run dev`

# Run with docker
```
docker build  -t launchpad .
docker run -p 3000:3000 -p 8108:8108 launchpad 
```
After building image, deploy container to Google Cloud run.