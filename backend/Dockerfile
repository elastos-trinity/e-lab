# using 16 as some issue related to essentials DID lib on 17
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install \
    && cp ./config/env-secret.template ./config/env-secret.ts \
    && sed -i "s|localhost|elab-mongo|g" ./config/env-secret.ts

EXPOSE 8080

CMD [ "npm", "start" ]
