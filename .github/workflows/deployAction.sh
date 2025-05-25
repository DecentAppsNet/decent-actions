#!/bin/bash

set -euo pipefail # Exit on error, undefined variable, or pipe failure.
actionName="$1"
distPath="$(pwd)/dist/$actionName"
srcPath="$(pwd)/src/$actionName"
token="${ACTIONS_PUSH_TOKEN:-localTesting}"

echo "Prepare dist folder for receiving clone."
mkdir -p "$distPath"
# If distPath exists, delete it for a fresh clone. Only happens in local testing.
if [ -d "$distPath" ]; then
  rm -rf "$distPath"
fi

echo "Clone existing action repo to dist folder."
if [[ "$token" == "localTesting" ]]; then
  cloneUrl="git@github.com:DecentAppsNet/$actionName.git"
else
  cloneUrl="https://$token@github.com/DecentAppsNet/$actionName.git"
fi
git clone "$cloneUrl" "$distPath"

echo "Copy and build from source folder to dist folder."
cd "$srcPath" || exit 1
cp ./README.md "$distPath/"
cp ./LICENSE "$distPath/"
cp ./action.yml "$distPath/"
npx esbuild ./main.ts --bundle --platform=node --format=esm --outfile="$distPath"/main.js --minify
echo "Build completed for \"$actionName\" in dist folder."

echo "Does new dist folder build differ from what is already in the action repo?"
cd "$distPath" || exit 1
git add .
if git diff-index --quiet HEAD --; then
  echo "::notice::No changes for \"$actionName\" action found, so skipping deployment."
  exit 0
fi

echo "Changes detected, so deploying new version of action."
git commit -am "Updating \"$actionName\" action. See https://github.com/DecentAppsNet/decent-actions monorepo for relevant source commit history."
git push origin main || {
  echo "::error::Failed to push changes for \"$actionName\" action."
  exit 1
}

echo "::notice::Successfully updated \"$actionName\" action."
