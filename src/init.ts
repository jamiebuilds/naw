import fs from "fs"
import path from "path"
import util from "util"
import makeDir from "make-dir"
import pathExists from "path-exists"
import { println } from "./logger"

let writeFile = util.promisify(fs.writeFile)

let CONFIG_FILE = JSON.stringify(
	{
		tasks: {
			example: {
				description: "Run an example build tool",
				build: "./tasks/example",
				args: [],
			},
		},
	},
	null,
	2,
)

let DOCKERFILE = `
#### Stage: builder ####
FROM buildpack-deps as builder
WORKDIR /

# Setup your tool...
COPY script.sh .
RUN chmod +x script.sh

WORKDIR /workdir
ENTRYPOINT [ "/script.sh" ]

#### Stage: tester ####
FROM builder as tester
WORKDIR /
RUN git clone https://github.com/sstephenson/bats.git
RUN ./bats/install.sh /usr/local
COPY test.bats .
WORKDIR /workdir
ENTRYPOINT [ "bats" ]
CMD [ "/test.bats" ]
`.trim()

let SCRIPT_FILE = `
#!/bin/bash
set -euo pipefail

echo "Running an example build tool..."
sleep 3
echo "Success!"
`.trim()

let TEST_FILE = `
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
`.trim()

export async function initProject(cwd: string) {
	println("")

	if (await pathExists(path.join(cwd, "naw.json"))) {
		println("{bold Project already created.}")
		println("")
		return
	}

	println("{bold Creating a new naw project...}")
	println("")

	let dir = path.join(cwd, "tasks", "example")
	println("{green +} ./naw.json")
	await writeFile(path.join(cwd, "naw.json"), CONFIG_FILE + "\n")
	await makeDir(dir)
	println("{green +} ./tasks/example/Dockerfile")
	await writeFile(path.join(dir, "Dockerfile"), DOCKERFILE + "\n")
	println("{green +} ./tasks/example/script.sh")
	await writeFile(path.join(dir, "script.sh"), SCRIPT_FILE + "\n")
	println("{green +} ./tasks/example/test.bats")
	await writeFile(path.join(dir, "test.bats"), TEST_FILE + "\n")
	println("")
}
