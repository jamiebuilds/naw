#!/usr/bin/env bats

function setup() {
  touch fixture.txt
}

function teardown() {
  rm fixture.txt
}

@test "works" {
  run /script.sh
  [ "$status" -eq 0 ]
  [[ "$output" = *"Running an example build tool..."* ]]
  [[ "$output" = *"Success!"* ]]
}
