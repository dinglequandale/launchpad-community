# launchpad-platform
A platform that revolutionizes high schoolers' access to valuable connections and on-site job experience

# How to Run
Make sure you have `docker` installed. First, `cd` into `launchpad/`:

`npm install`

Then, obtain a Firebase Admin SDK private key (should be a JSON file). This is used to populate the typesense server with the information from Firestore. **Only do this once:**
```
npm run start-typesense-server
npm run populate
```

Finally:

`npm run dev`