const NODE_ENV = process.env.NODE_ENV || 'development'
const DOMAIN_ENV = process.env.DOMAIN_ENV || 'localhost'
const SECURE =
  process.env.SECURE === undefined
    ? DOMAIN_ENV !== 'localhost'
    : process.env.SECURE === 'true'

let gaTrackingId = null
const auth0 = {
  clientId: 'uV3znguWm0T67gSJnSe4ggRpAjkpuVii',
  domain: 'dev-9v7hn33g.us.auth0.com',
  audience: 'https://dev-9v7hn33g.us.auth0.com/api/v2/',
  scope:
    'read:current_user update:current_user_metadata read:current_user_metadata'
}

if (DOMAIN_ENV === 'app.buildee.com') {
  console.log('production')
  gaTrackingId = 'UA-36517459-6'
  auth0.clientId = 'W9L7yrkXKmFaenNhi87nN3TyUZ1pRPUY'
} else if (
  DOMAIN_ENV === 'beta.buildee.com' ||
  DOMAIN_ENV === 'pre-prod.buildee.com'
) {
  console.log('beta')
  gaTrackingId = '254675137'
  auth0.clientId = 'VPmXeCbhzpQHgXFGLIJgdbXCYUhg8LsC'
}

module.exports = {
  /** The environment to use when building the project */
  env: NODE_ENV,
  /** The full path to the project's root directory */
  basePath: __dirname,
  /** The name of the directory containing the application source code */
  srcDir: 'src',
  /** The file name of the application's entry point */
  main: 'main',
  /** The name of the directory in which to emit compiled assets */
  outDir: 'dist',
  /** The base path for all projects assets (relative to the website root) */
  publicPath: '/',
  /** Whether to generate sourcemaps */
  sourcemaps: true,
  /** A hash map of keys that the compiler should treat as external to the project */
  externals: {},
  /** A hash map of variables and their values to expose globally */
  globals: {},
  /** Whether to enable verbose logging */
  verbose: false,
  /** The list of modules to bundle separately from the core application code */
  vendors: [
    'react',
    'react-dom',
    'redux',
    'react-redux',
    'redux-thunk',
    'react-router'
  ],
  /** The key used to target the local storage to rehydrate the store */
  localStorageKey: 'simuwatt-insights',
  /** Use https - true/false */
  secure: SECURE,
  /** The uri to the api, include port if needed (192.168.1.101:3001) */
  /** Do not include a trailing slash */
  apiHost: DOMAIN_ENV + '/api',
  /** google analytics tracking code */
  gaTrackingId,
  /** auth0 config */
  auth0
}
