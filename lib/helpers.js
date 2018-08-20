/*
 * Helpers for various tasks
 */
const crypto = require("crypto");
const { secret } = require("../config");

const helpers = {};

helpers.hash = str => {
  if (!(typeof str == "string" && str.length > 0)) return false;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(str)
    .digest("hex");
  return hash;
};

helpers.parseJsonToObject = str => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

module.exports = helpers;
