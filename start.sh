#!/bin/bash
arch=$(uname -m)

echo "The system arch is $arch"

if [ "$arch" = "armv7l" ]
then
  cd ~/irrigation-controller || exit
fi

npm install && npm run start
