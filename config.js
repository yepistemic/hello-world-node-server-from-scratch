const environments = {};
const env = process.env.NODE_ENV;

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production"
};

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging"
};

module.exports = environments[env] ? environments[env] : environments.staging;
