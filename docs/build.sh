#!/bin/bash
set -e

npm run clean

npm run build 

api-extractor run -l -c docs/extractor.json 

api-documenter markdown -i docs/generated/api-extractor -o docs/generated/markdown 

echo '---
hide:
  - navigation
---' | cat - README.md > temp && mv temp docs/generated/markdown/index.md 

mkdocs build -f ./docs/mkdocs.yml -d ./generated/website