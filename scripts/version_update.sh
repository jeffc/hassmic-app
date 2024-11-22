#!/bin/sh
# Replace the version string in all relevant files

PROJECT_ROOT=`git rev-parse --show-toplevel`

pushd .

cd $PROJECT_ROOT

VERSION=`cat VERSION`

echo "Updating version files to $VERSION"

echo "Ensuring required packages are present"
npm install

# update the app constants file
sed -e "s/APP_VERSION = \"[^\"]*\"/APP_VERSION = \"$VERSION\"/" -i app/app/constants.ts

# update the package and package-lock files using jq
TEMPFILE=`mktemp`
FILE=app/package.json
npx node-jq \
  --arg version "$VERSION" \
  '(.version)=$version' < $FILE > $TEMPFILE;

if cmp -s $TEMPFILE $FILE
then
  mv $TEMPFILE $FILE;
else
  rm $TEMPFILE
fi;

TEMPFILE=`mktemp`
FILE=app/package-lock.json
npx node-jq \
  --arg version "$VERSION" \
  '(.version,(.packages[]|select(.name=="hassmic")).version)=$version' < $FILE > $TEMPFILE;

if cmp -s $TEMPFILE $FILE
then
  mv $TEMPFILE $FILE;
else
  rm $TEMPFILE
fi;

#update the HACS manifest
TEMPFILE=`mktemp`
FILE=custom_components/hassmic/manifest.json
npx node-jq \
  --arg version "$VERSION" \
  '(.version)=$version' < $FILE > $TEMPFILE;

if cmp -s $TEMPFILE $FILE
then
  mv $TEMPFILE $FILE;
else
  rm $TEMPFILE
fi;

popd
