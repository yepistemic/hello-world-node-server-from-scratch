/*
 *  Request handlers
 */
const _data = require("./data");
const helpers = require("./helpers");

const handlers = {};

handlers.users = function(data, cb) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, cb);
  } else {
    cb(405);
  }
};

handlers._users = {};

handlers._users.post = async (data, cb) => {
  // sanitize user provided data
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length > 0
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean"
      ? data.payload.tosAgreement
      : false;

  if (!(firstName && lastName && phone && password && tosAgreement)) {
    console.log("test:", tosAgreement);
    cb(400, { Error: "Missing required fields" });
    return;
  }

  // check if the user exists
  try {
    const user = await _data.read("users", phone);

    // this user already exists. Send back an error
    if (user) {
      cb(400, { Error: "A user with that phone number already exists." });
      return;
    }
  } catch (err) {
    // this user does not exist yet. Create them.

    // hash Password
    const hashedPassword = helpers.hash(password);
    if (!hashedPassword) {
      console.log("Could not hash the user's password.");
      cb(500, { Error: "Could not hash the user's password." });
    }

    const userObj = {
      firstName,
      lastName,
      password,
      phone,
      hashedPassword,
      tosAgreement: true
    };

    _data
      .create("users", phone, userObj)
      .then(() => cb(200))
      .catch(err => {
        console.log(err.toString());
        cb(500, { Error: "Could not create the new user" });
      });
  }
};

handlers._users.get = (data, cb) => {};

handlers._users.put = (data, cb) => {};

handlers._users.delete = (data, cb) => {};

handlers.hello = (data, callback) => {
  callback(200, { hello: "world" });
};

handlers.notFound = (data, callback) => {
  callback(404, { Error: "Not Found" });
};

module.exports = handlers;
