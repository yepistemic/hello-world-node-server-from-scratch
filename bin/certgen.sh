#!/bin/bash

cd ../

# if the https directory doesn't exist, make it
if [ ! -d "https" ]; then
  mkdir https
fi

cd https

openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

cd ../bin
