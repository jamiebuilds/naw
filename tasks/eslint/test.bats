#!/usr/bin/env bats

function setup() {
  echo "{ \"extends\": \"eslint:recommended\" }" > ./.eslintrc
}

function teardown() {
  rm -rf ./*
}

@test "eslint --help" {
  run /script.sh --help
  [[ "$output" = *"[eslint] Linting..."* ]]
  [[ "$output" = *"[options] file.js [file.js] [dir]"* ]]
}

@test "eslint ." {
  echo "var value = 42" > badfile.js
  run /script.sh .
  [ "$status" -eq 1 ]
  [[ "$output" = *"badfile.js"* ]]
  [[ "$output" = *"is assigned a value but never used."* ]]
  [[ "$output" = *"no-unused-vars"* ]]
  [[ "$output" = *"1 error"* ]]
}

@test "eslint --fix" {
  echo "label: while (true) {}" > badfile.js
  run /script.sh . --fix
  [[ "$(cat badfile.js)" != *"label:"* ]]
  [[ "$(cat badfile.js)" = *"while (true) {}"* ]]
}
