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
  console.log(typeof data.payload.firstName);

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

/**
 * GET a user
 * @param  {object}   data a request object containing of the form { queryStringObject: { phone: [string[10]] } }
 * @param  {Function} cb   a callback to be called when the method is finished running
 * @TODO Only let an authenticated user access their object. Don't let them access anyone else's.
 */
handlers._users.get = async (data, cb) => {
  // check the phone number is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (!phone) {
    cb(400, {
      Error: "Invalid field: phone. Phone must be a string of length 10"
    });
    return;
  }

  try {
    const { data: user } = await _data.read("users", phone);

    // remove the hashedPassword from the user object before sending it out
    delete user.hashedPassword;
    cb(200, user);
  } catch (err) {
    cb(404);
  }
};

/**
 * Update a user
 * @param  {object}   data { phone }
 * @param  {Function} cb   a callback to be called when the method is finished running
 * @TODO Only let an authenticate user access their own object.
 */
handlers._users.put = async (data, cb) => {
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

  // Error if the phone is invalid
  if (!phone) cb(400, { Error: "Missing required field" });

  // I should have atleast one of these fields
  if (!firstName && !lastName && !password)
    cb(400, { Error: "Missing field to update" });

  try {
    const { data: user } = await _data.read("users", phone);

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    if (password) {
      user.hashedPassword = helpers.hash(password);
    }

    _data
      .update("users", phone, user)
      .then(() => cb(200))
      .catch(err => {
        console.log(err);
        cb(500, { Error: "Could not update the user" });
      });
  } catch (err) {
    cb(400, { Error: "The specified user does not exist" });
    return;
  }
};

/**
 * Delete a user
 * @param  {object}   data { phone }
 * @param  {Function} cb   a callback to be called when the method is finished running
 * @TODO Only let an authenticate user access their own object
 */
handlers._users.delete = async (data, cb) => {
  // check the phone number is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (!phone) {
    cb(400, {
      Error: "Invalid field: phone. Phone must be a string of length 10"
    });
    return;
  }

  try {
    // check if the user exists. If not, catch the error
    await _data.read("users", phone);

    _data
      .delete("users", phone)
      .then(() => cb(200))
      .catch(err => {
        console.log(err);
        cb(500, { Error: "Could not delete the specified user" });
      });
  } catch (err) {
    cb(400, { Error: "Could not find the specified user" });
  }
};

handlers.tokens = function(data, cb) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, cb);
  } else {
    cb(405);
  }
};

handlers._tokens = {};

/**
 * Create a token
 * @param  {object}   data { phone, password }
 * @param  {Function} cb   a function to be called when the method is finished
 */
handlers._tokens.post = async (data, cb) => {
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

  if (!(phone && password)) {
    cb(400, { Error: "Missing required fields" });
    return;
  }

  let user;

  try {
    const dbResponse = await _data.read("users", phone);
    user = dbResponse.data;
  } catch (err) {
    console.log(err);
    cb(400, { Error: "Could not find the specified user." });
    return;
  }

  // Hash the sent password and compare it to the password stored
  // stored in the user object
  const hashedPassword = helpers.hash(password);
  if (hashedPassword !== user.hashedPassword) {
    cb(400, {
      Error: "Password did not match the specified user's stored password."
    });
    return;
  }

  // create a new token with a random name. Set the expiration date to 1 hour in the future.
  const tokenId = helpers.createRandomString(20);
  const expires = Date.now() + 1000 * 60 * 60;

  const tokenObject = {
    phone,
    id: tokenId,
    expires
  };

  // store the token
  _data
    .create("tokens", tokenId, tokenObject)
    .then(() => cb(200, tokenObject))
    .catch(err => cb(500, { Error: "Could not create the new token." }));
};

handlers._tokens.get = function(data, cb) {};

handlers._tokens.put = function(data, cb) {};

handlers._tokens.delete = function(data, cb) {};

handlers.hello = (data, callback) => {
  callback(200, { hello: "world" });
};

handlers.notFound = (data, callback) => {
  callback(404, { Error: "Not Found" });
};

module.exports = handlers;
