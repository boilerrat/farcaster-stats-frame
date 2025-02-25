#!/bin/bash

# Remove the file from Git tracking but keep it locally
git rm --cached -r .cursor/

# Remove the file from Git's history
git filter-branch --force --index-filter \
  "git rm -r --cached --ignore-unmatch .cursor/" \
  --prune-empty --tag-name-filter cat -- --all

# Force push the changes
echo "Now run: git push origin --force --all" 