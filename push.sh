#!/bin/bash
# BhumiShop push script with meaningful commit message

if [ -z "$1" ]; then
  echo "Usage: ./push.sh <commit message>"
  echo "Example: ./push.sh 'fix: resolve asset loading on GitHub Pages'"
  exit 1
fi

git add .
git commit -m "$1"
git push
