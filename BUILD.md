# Deployment

## Backend

- Clone config/env-secret.template into env-secret.ts and configure it
- npm start

## Frontend

- Create a .env file and define REACT_APP_API_URL to the right backend url.
- npm build

## Initial setup

- Sign in with a DID
- In database, change this user type as "admin" + add field "canManageAdmins: true" (to manage other admins)