#!/bin/sh
# Regenerate the language-specific protobuf files

# ensure that we're in a python venv

PROJECT_ROOT=`git rev-parse --show-toplevel`
PYTHON_PREFIX=`python3 -c 'import sys; print(sys.prefix)'`

echo "Project prefix is '${PROJECT_ROOT}'"
echo "Python prefix is '${PYTHON_PREFIX}'"

pushd .

cd $PROJECT_ROOT

if [[ ${PYTHON_PREFIX} != "${PROJECT_ROOT}/venv" ]];
then
  echo "Not currently in venv; creating and activating it"
  python3 -m venv venv
  source venv/bin/activate
fi

echo "Ensuring required packages are present"
pip install -r requirements.txt
npm install

echo "Deleting old generated files"

rm -r app/app/proto/*
rm -r custom_components/hassmic/proto/*
rm -r app/android/app/src/main/java/com/thejeffcooper/hassmic/proto/*


echo "Regenerating sources from protos"
protoc \
  --plugin=node_modules/.bin/protoc-gen-ts \
  --ts_out=app/app/proto \
  --python_betterproto_out=custom_components/hassmic/proto \
  --java_out=lite:app/android/app/src/main/java/ \
  -I proto proto/*


popd
