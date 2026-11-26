# launchpad-platform

A platform that revolutionizes high schoolers' access to valuable connections and on-site job experience.

The app lives in [`launchpad/`](launchpad/): a React + Vite frontend, Firebase (Auth, Firestore,
Storage, Hosting, Cloud Functions) and Stream Chat. Search uses Algolia.

## Run locally

```bash
cd launchpad
cp .env.example .env        # fill in the public client config (see comments in the file)
npm install
npm run dev                  # http://localhost:3000
```

Cloud Functions:

```bash
cd launchpad/functions
cp .env.example .env         # Stream server credentials (never commit this file)
npm install
npm run serve                # local emulator
```

## Deploy

Hosting deploys automatically from `main` via GitHub Actions
(`.github/workflows/firebase-hosting-merge.yml`). Rules and functions are deployed manually:

```bash
cd launchpad
firebase deploy --only firestore:rules,storage
firebase deploy --only functions
```

Deploy **rules and functions together**: the frontend now relies on new callables
(`deleteMyAccount`, `verifySocietyAccessCode`, `redeemSocietyAccessCode`) and the rules
deny client writes that the old functions-less flows used to make.

## Administrators

Admin-only callables (graduation emails, Sheets re-sync) and admin reads in Firestore rules
check for a document at `admins/{uid}`. Create one from the Firebase console for each admin;
clients cannot write to that collection.

## Search

Search is in-house; there is no external search service.
- **People and opportunities:** each document carries a `searchTokens` array (word prefixes of
  its searchable fields), maintained by Cloud Functions (`functions/triggers/searchIndex.js`).
  The client queries it with `array-contains` (`src/services/searchServices.jsx`), so reads go
  through the normal security rules.
- **Colleges:** a bundled list from the U.S. Department of Education IPEDS directory
  (`src/data/colleges.json`, loaded lazily) searched locally (`src/services/collegeSearch.js`);
  users can also type a school that is not listed.

To (re)build the index for existing data, create a document in Firestore from the console:
`admin_tasks/<any id>` with `{ type: "rebuildSearchIndex" }`. The function writes its status and
counts back to that document.

## Tests

Requires Java 11+ and the Firebase CLI.

```bash
cd launchpad
npm run test:rules       # Firestore + Storage security rules (emulators)
npm run test:functions   # end-to-end Cloud Functions tests (emulators)
```
