FROM node:22

WORKDIR /launchpad

COPY ./launchpad/package*.json ./

RUN npm install --production

COPY ./launchpad /launchpad

# Install TypeSense
RUN curl -O https://dl.typesense.org/releases/26.0/typesense-server-26.0-linux-amd64.tar.gz
RUN tar -xzf typesense-server-26.0-linux-amd64.tar.gz

# Copy the script that will run both services
COPY start.sh /launchpad/start.sh
RUN chmod +x /launchpad/start.sh

# Command to run the start script
EXPOSE 3000 8108
CMD ["./start.sh"]
