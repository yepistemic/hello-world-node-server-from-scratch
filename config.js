const environments = {};
const env = process.env.NODE_ENV;

environments.production = {
  port: 5000,
  envName: "production"
};

environments.staging = {
  port: 3000,
  envName: "staging"
};

module.exports = environments[env] ? environments[env] : environments.staging;
