# Deployment

## Backend via host machine

- Clone config/env-secret.template into env-secret.ts and configure it
- npm start
 
## Backend via docker-compose

``` 
docker-compose up
```

ELAB:
- host: localhost
- port: 3031

MONGO:
- db: elab
- username: root
- password: root-password

## Frontend

- Create a .env file and define REACT_APP_API_URL to the right backend url.

``` 
npm install --force
npm run build
npm start
``` 

## Initial setup

- Sign in with a DID
- In database, change this user type as "admin" + add field "canManageAdmins: true" (to manage other admins)
