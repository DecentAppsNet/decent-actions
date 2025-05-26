#!/bin/bash

set -euo pipefail # Exit on error, undefined variable, or pipe failure.
actionName="$1"
distPath="$(pwd)/dist/$actionName"
srcPath="$(pwd)/src/$actionName"
bumpScriptPath="$(pwd)/.github/workflows/bumpVersion.js"
token="${ACTIONS_PUSH_TOKEN:-localTesting}"

echo -n "Prepare dist folder for receiving clone..."
mkdir -p "$(pwd)/dist"
# If distPath exists, delete it for a fresh clone. Only happens in local testing.
if [ -d "$distPath" ]; then
  rm -rf "$distPath"
fi
printf " done\n"

echo -n "Clone existing action repo to dist folder..."
if [[ "$token" == "localTesting" ]]; then
  if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
    printf " FAILED\n"
    echo "::error::ACTIONS_PUSH_TOKEN is not set and is needed when running in Github CI."
    exit 1
  fi
  cloneUrl="git@github.com:DecentAppsNet/$actionName.git"
else
  cloneUrl="https://$token@github.com/DecentAppsNet/$actionName.git"
fi
git clone "$cloneUrl" "$distPath" > /dev/null 2>&1 || {
  printf " FAILED\n"
  echo "::error::Failed to clone \"$actionName\" action repository."
  exit 1
}
printf " done\n"

echo -n "Copying from source folder to dist folder..."
cd "$srcPath" || exit 1
cp ./README.md "$distPath/"
cp ./LICENSE "$distPath/"
cp ./action.yml "$distPath/"
printf " done\n"
echo -n "Building \"$actionName\" action in the dist folder..."
npx esbuild ./main.ts --bundle --platform=node --format=esm --outfile="$distPath"/main.js --minify > /dev/null 2>&1 || {
  printf " FAILED\n"
  echo "::error::Failed to build \"$actionName\" action."
  exit 1
}
printf " done\n"

echo -n "Does new dist folder build differ from what is already in the action repo?..."
cd "$distPath" || exit 1
git add .
if git diff-index --quiet HEAD --; then
  printf " no.\n"
  echo "::notice::✅ No changes for \"$actionName\" action found, so skipping deployment."
  exit 0
fi
printf " yes.\n"

echo -n "Determining next semantic version tag..."
latestTag=$(git tag --sort=-v:refname | grep '^v[0-9]\+\.[0-9]\+\.[0-9]\+$' | head -n1 2>/dev/null || echo "none")
nextVersion=$(node "$bumpScriptPath" "$latestTag" "${MAJOR_MINOR_VERSION:-}")
nextMajorVersion="${nextVersion%%.*}"  # Removes everything after first dot, e.g. "v1.2.3" -> "v1".
if git rev-parse "$nextVersion" >/dev/null 2>&1; then
  printf " FAILED\n"
  echo "::error::Tag $nextVersion already exists. Aborting."
  exit 1
fi
printf " $nextVersion\n"

echo -n "Deploying new version of action..."
git config user.name "Decent Deploy Bot"
git config user.email "info@decentapps.net"
tmpErr=$(mktemp)
git commit -am "Updating \"$actionName\" action. See https://github.com/DecentAppsNet/decent-actions monorepo for relevant source commit history." 2>"$tmpErr" || {
  printf " FAILED\n"
  echo "::error::Failed to commit changes for \"$actionName\" action."
  echo "::error::Commit error details:"
  cat "$tmpErr"
  exit 1
}
rm -f "$tmpErr"
git tag "$nextVersion" 2>/dev/null || {
  printf " FAILED\n"
  echo "::error::Failed to create \"$nextVersion\" tag for \"$actionName\" action."
  exit 1
}
git tag -f "$nextMajorVersion" 2>/dev/null || {
  printf " FAILED\n"
  echo "::error::Failed to update \"$nextMajorVersion\" tag for \"$actionName\" action."
  exit 1
}
git push origin main "$nextVersion" 2>/dev/null || {
  printf " FAILED\n"
  echo "::error::Failed to push changes for \"$actionName\" action."
  exit 1
}
git push origin -f "$nextMajorVersion" 2>/dev/null || {
  printf " FAILED\n"
  echo "::error::Failed to push major version tag for \"$actionName\" action. Manual cleanup of repo state may be required."
  exit 1
}
printf " done\n"

echo "::notice::✅ Successfully updated \"$actionName\" action."