const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");

const httpServer = http.createServer((req, res) => {
  // url: /hello/hi?q=402
  const parsedUrl = url.parse(req.url, true);

  // pathname: /hello/hi
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\+$/g, "");

  // querystring
  const queryStringObject = parsedUrl.query;

  // method
  const method = req.method;

  // headers
  const headers = req.headers;

  // decoder object for converting buffer data to utf-8 string
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  // write the data to buffer
  req.on("data", data => {
    buffer += decoder.write(data);
  });

  // we've reached the end of the data
  req.on("end", () => {
    buffer += decoder.end();

    const chosenHandler = router[trimmedPath]
      ? router[trimmedPath]
      : router.notFound;

    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 200;
      payload = typeof payload === "object" ? payload : {};

      const payloadString = JSON.stringify(payload);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
});

// method that handle responses
const handlers = {
  hello: (data, callback) => {
    callback(200, { hello: "world" });
  },
  notFound: (data, callback) => {
    callback(404);
  }
};

const router = {
  hello: handlers.hello,
  notFound: handlers.notFound
};

httpServer.listen(config.port, () => {
  console.log(
    "listening on port",
    config.port,
    "in environment",
    config.envName
  );
});
