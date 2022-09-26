# Insights

## Requirements

* node `8.15.1` (https://github.com/creationix/nvm)
* yarn `^0.23.0` or npm `^3.0.0` (https://yarnpkg.com/en/docs/install#alternatives-tab)

```bash
$ yarn  # Install project dependencies (or `npm install`)
```

## Running the Project
The app is served through webpack only in development. When it runs on QA/Beta/Production, it is built and served through the docker container.
Run this command inside the folder root to work with the app locally:
```bash
$ yarn start  # Start the development server (or `npm start`)
```

### More info
https://github.com/davezuko/react-redux-starter-kit/blob/master/README.md


## Integration Testing
Add a file name cypress.env.json at the root of the project with the following schema:
```json
{
  "test_user": "valid@test.com",
  "test_password": "MyTestPassword!",
  "test_organization": "someorganizationuuid",
  "api_url": "https://qa-graphql.buildee.com"
}
```

```bash
$ npm run test:integration # runs all integration tests to completion
```

or, for a more interactive testing environment, run
```bash
$ npm run cypress:open
```

### More info
https://docs.cypress.io
