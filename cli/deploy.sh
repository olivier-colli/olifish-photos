#! /usr/bin/env bash

sudo apt-get update
sudo apt-get install libimage-exiftool-perl
sudo apt-get install imagemagick

exiftool -ver

node --experimental-modules --no-warnings cli/composeDB.mjs
git add data.json
git commit -m "Update data.json"

git push https://$token@github.com/olivier-colli/olifish-tofs.git
