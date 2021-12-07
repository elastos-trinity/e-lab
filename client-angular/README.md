<h1 align="center">ELAB client - WIP</h1>

<p align="center">
  <a href="https://github.com/facebook/jest">
    <img src="https://jestjs.io/img/jest-badge.svg" alt="unit tests with Jest" />
  </a>&nbsp;
</p>

<hr>

## Prerequisites
### Setup
Due to some dependencies this project run the best with a node version >= 14 and npm version ^7.5.  
This is the ideal setup, and it shouldn't be a problem running a different version but if you have any troubles running it, check both your node and npm version.  
You will also need to go through the KYC-me verification process.

### Knowledge
Here are some nice-to-have prior knowledge for each part of the project
#### The logic: Angular
Basic usage of Angular including services, DI, guards and interceptor.
#### The authentication: The authentication process
Even if this is a frontend application it's good to have some understanding of the w3c Verifiable Credentials Data Model and the Elastos Connectivity SDK.  
Some links:  
https://www.w3.org/TR/vc-data-model/
https://developer.elastos.org/services/connectivity/
https://github.com/elastos/Elastos.Connectivity.Client.JS.SDK
https://developer.elastos.org/services/did/guides/interactive_operations/
https://github.com/elastos/Elastos.DID.Method/blob/master/VerifiableClaims/Elastos-Verifiable-Claims-Specification_en.md
#### The design: TailwindCSS
Basic understanding of TailwindCSS   

todo: add more documentation about the KYC-me process and brief introduction about the auth process.

## 🧙‍♂️ Commands

| Command     | Description                                                             | NPM                 | Yarn             | Background command                                          |
| ----------- | ----------------------------------------------------------------------- | ------------------- | ---------------- | ----------------------------------------------------------- |
| ng          | See available commands                                                  | npm run ng          | yarn ng          | ng                                                          |
| start       | Run the ELAB client in development mode                                 | npm start           | yarn start       | ng serve                                                    |
| build       | Build the ELAB client  for production                                   | npm run build       | yarn build       | ng build                                                    |
| build:stats | Build the ELAB client  for production and generate a "stats.json" file  | npm run build:stats | yarn build:stats | ng build --stats-json                                       |
| watch       | Run build when files change.                                            | npm run watch       | yarn watch       | ng build --watch --configuration development                |
| test        | Run the unit tests                                                      | npm run test        | yarn test        | ng test                                                     |
| lint        | Use ESLint to lint the app                                              | npm run lint        | yarn lint        | ng lint                                                     |
| analyze     | Open webpack-bundle-analyzer                                   | npm run analyze     | yarn analyze     | webpack-bundle-analyzer dist/client-angular/stats.json |


# Documentation - todo: move this to wiki ?
## Features

- Strict directory structure.
- Strict mode.
- TailwindCSS + Autoprefixer + PurgeCSS setup.
- Smart and pure components pattern.
- SCAM pattern.
- Self-contained components and encapsulated modules.
- Components types (e.g. component, page).
- Unit tests with Jest.
- e2e tests with Cypress.
- PWA.
- ESLint.

## ⛩️ Project structure

```console
├───app
│   ├───@core : Contain all the core components
│   │   ├───directives: Our core directives - Ex: click outside modal will reside here
│   │   ├───guards: Our core guards - Ex: authentication guard
│   │   ├───interceptors: Our core interceptors - Ex: Interceptor to add JWT to all our calls
│   │   ├───services: Our core services
│   │   └───utils: Our core utils
│   ├───@shell : Contains all our application shell
│   │   ├───ft
│   │   └───ui (layout components)
│   │       ├───footer
│   │       ├───header
│   │       ├───layout
│   │       └───not-found
│   └───pages : Contains all our pages and their related services
│       ├───auth : Every operation related to the authentication
│       │   ├───pages
│       │   │   ├───sign-in
│       │   └───services
│       ├───...
├───assets : Our assets folder
├───environments : Environments variables
└───theme : Our SCSS
    ├───01-base
    ├───02-components
    └───03-utilities
```


## 📄 Pages

```
Types of pages  
- public: everybody can see and use them
- private: only logged in users can see and use them
- admin: only admin users can see and use them
```

- General
  - home: Public - This should redirect to the auth page if we are not logged in.
  - not-found: Public 
- Auth
  - sign-in: Public - Once sign-in redirect the user to the dashboard.
- Proposals: 
  - community-proposal: Private
  - my-proposal: Private
- Settings:
  - my-profile: Private
  - admin: Admin

## 📡 Services

- AuthService: Used for ELAB authentication 
- ThemeService: Used for theme selection
