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

helpers.createRandomString = function(strLength) {
  strLength =
    typeof strLength === "number" && strLength > 0 ? strLength : false;

  if (!strLength) return false;

  const possibleCharacters = "qwertyuiopasdfghjklzxcvbnm1234567890";

  let str = "";

  for (let i = 0; i <= strLength; i++) {
    const randomCharacter = possibleCharacters.charAt(
      Math.floor(Math.random() * possibleCharacters.length)
    );
    str += randomCharacter;
  }

  return str;
};

module.exports = helpers;
