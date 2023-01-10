#!/bin/bash

echo "Building Krono's 2 App:"
echo ""
echo "> cleaning www folder..."
rm -rf www
mkdir www
echo "> removing app.zip..."
rm -rf app.zip
echo "> build app using webpack..."
./node_modules/.bin/webpack --config ./webpack/webpack.prod.mjs
echo "> copying static files..."
cp -rf ./static/* ./www
echo "> list all files..."
ls
echo "> zipping all files..."
zip -r app.zip assets www config.json
echo "> done!"
sleep 3
exit