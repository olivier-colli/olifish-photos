#! /usr/bin/env bash

sudo apt-get update
sudo apt-get install libimage-exiftool-perl
sudo apt-get install imagemagick

exiftool -ver

git checkout master
node --experimental-modules --no-warnings cli/composeDB.mjs
git add data.json
git commit -m "Update data.json"
./cli/convertThumbs.sh
git add thumb
git commit -m "Optimize thumbs"

git push https://$token@github.com/olivier-colli/olifish-photos.git
