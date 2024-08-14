#!/bin/bash

# Start the typesense-server in the background
./typesense-server -p 8108:8108 --api-key=xyz --data-dir=/launchpad/typesense-server-data --listen-port 8108 --enable-cors &
npm run populate

# Start the Node.js application
npm run dev -- --host