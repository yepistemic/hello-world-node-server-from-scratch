# hello world node server from scratch

## Installation and Running

First clone the repository and cd into the directory
```
$ git clone https://github.com/yepistemic/hello-world-node-server-from-scratch
$ cd hello-world-node-server-from-scratch
```

Then generate an SSL certificate for the HTTPS server and fill out the information
```
$ cd bin && sh certgen.sh && cd ../
```

You may have to use sudo instead
```
$ cd bin && sudo sh certgen.sh && cd ../
```

Filling out the information:
```
$ Country Name (2 letter code) []: US
$ State or Province Name (full name) []: California
$ Locality Name (eg, city) []: San Diego
$ Organization Name (eg, company) []: Yepistemic
$ Organizational Unit Name (eg, section) []: Research and Development
$ Common Name (eg, fully qualified host name) []: localhost
$ Email Address []: yepistemic@gmail.com
```

Then just run the server
```
$ node index.js
```


## Make requests
Right now there are two endpoints. One for 404 errors, and one for /hello.
```
$ curl localhost:3000/hello
```

If you're going to use curl to make requests to the https server, make sure to
include 'https://' and the -k flag.
```
$ curl -k https://localhost:3001/hello
```
