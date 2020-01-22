#! /usr/bin/env bash

rm -Rf thumb/*
for file in img/thumb/*.jpg
do
  convert $file -thumbnail "300x200!" -sampling-factor 4:2:0 -strip -quality 70 -interlace JPEG -colorspace sRGB "thumb/$(basename $file)"
done