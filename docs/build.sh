#!/bin/bash
set -e

npm run clean

npm run build 

api-extractor run -l -c docs/extractor.json 

api-documenter markdown -i docs/generated/api-extractor -o docs/generated/markdown 
