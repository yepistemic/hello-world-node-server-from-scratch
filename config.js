const environments = {};
const env = process.env.NODE_ENV;

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  // intentionally the same as staging's secret
  secret: "&gD0QW0NwkzPhv8w0%FZ8iasJ9fe*&Dc"
};

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  // intentionally the same as production's secret
  secret: "&gD0QW0NwkzPhv8w0%FZ8iasJ9fe*&Dc"
};

module.exports = environments[env] ? environments[env] : environments.staging;
