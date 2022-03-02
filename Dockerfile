FROM node:17.6-alpine3.14
WORKDIR /home/node/app
COPY sample.js /home/node/app/
COPY package.json /home/node/app/
RUN npm install
