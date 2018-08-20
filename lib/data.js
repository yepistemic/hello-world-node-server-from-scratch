/*
 *  Library for storing and editing data
 *
 */
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Promise based filesystem api
const fsp = {
  open: promisify(fs.open),
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  close: promisify(fs.close),
  truncate: promisify(fs.truncate),
  unlink: promisify(fs.unlink)
};

// Base directory for the data folder
const baseDirectory = path.join(__dirname, "/../.data/");

/**
 *  Create a file and write data to it
 *  @param {string} directory - the directory of the file to store data
 *  @param {string} fileName - the name of the file to store data
 *  @param {Object} data - an object that represents the data to be stored
 *  @return {Promise}
 */
const create = async (directory, fileName, data) => {
  const resolvedFileName = baseDirectory + directory + "/" + fileName + ".json";
  const stringData = JSON.stringify(data);

  const fd = await fsp.open(resolvedFileName, "wx");
  await fsp.writeFile(fd, stringData);
  await fsp.close(fd);

  return Promise.resolve({ directory, fileName, data });
};

/**
 * Read an existing file
 * @param  {string}  directory the name of the directory inside of .data containing the file to read
 * @param  {string}  fileName  the name of the file to read
 * @return {Promise}
 */
const read = async (directory, fileName) => {
  const resolvedFileName = baseDirectory + directory + "/" + fileName + ".json";
  const data = JSON.parse(await fsp.readFile(resolvedFileName, "utf-8"));
  return Promise.resolve({ directory, fileName, data });
};

/**
 * Update the data inside a file
 * @param  {string}  directory the name of the directory inside of .data containing the file to be updated
 * @param  {string}  fileName  the name of the file
 * @param  {Object}  data      data to the write to the file
 * @return {Promise}
 */
const update = async (directory, fileName, data) => {
  const resolvedFileName = baseDirectory + directory + "/" + fileName + ".json";
  const stringData = JSON.stringify(data);

  const fd = await fsp.open(resolvedFileName, "r+");
  await fsp.truncate(fd);
  await fsp.writeFile(fd, stringData);
  await fsp.close(fd);
  return Promise.resolve({ directory, fileName, data });
};

/**
 * Delete a file
 * @param  {string} directory the name of the diretory inside of .data containing the file to be deleted
 * @param  {string} fileName  the name of the file to be deleted
 * @return {Promise}
 */
const deleteFile = async (directory, fileName) => {
  const resolvedFileName = baseDirectory + directory + "/" + fileName + ".json";
  await fsp.unlink(resolvedFileName);
  return Promise.resolve({ directory, fileName });
};

module.exports = { create, read, update, delete: deleteFile };
