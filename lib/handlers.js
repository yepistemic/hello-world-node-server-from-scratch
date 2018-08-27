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
 * @TODO Only let an authenticate duser access their own object.
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

handlers._users.delete = (data, cb) => {};

handlers.hello = (data, callback) => {
  callback(200, { hello: "world" });
};

handlers.notFound = (data, callback) => {
  callback(404, { Error: "Not Found" });
};

module.exports = handlers;
