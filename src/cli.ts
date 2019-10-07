#!/usr/bin/env node
import meow from "meow"
import chalk from "chalk"
import replaceAll from "string.prototype.replaceall"
import extractStack from "extract-stack"
import * as commands from "./commands"
import { println } from "./logger"
import { ProcessError } from "./spawn"

let ERROR_TYPE_REGEX = /^([a-zA-Z]*Error)(: )?/
let startTime = Date.now()

let cli = meow({
	help: `
		Usage
			$ naw
			$ naw --init                    Init a new naw project
			$ naw <task>                    Run <task>
			$ naw <task> --build/-b         Build <task>
			$ naw <task> --test/-t          Test <task>
			$ naw <task> --debug/-d         Debug <task>
			$ naw <task> --debug --test     Debug <task> tests
			$ naw <task> --build --debug    Build+Debug <task>
	`,
	flags: {
		init: {
			type: "boolean",
		},
		build: {
			type: "boolean",
			alias: "b",
		},
		test: {
			type: "boolean",
			alias: "t",
		},
		debug: {
			type: "boolean",
			alias: "d",
		},
	},
})

interface Flags {
	init?: boolean
	build?: boolean
	test?: boolean
	debug?: boolean
}

async function main(cwd: string, input: string[], flags: Flags) {
	let taskName = input[0]
	let init = flags.init
	let build = flags.build
	let test = flags.test
	let debug = flags.debug

	if (build || test || debug) {
		if (init) {
			throw new Error("--init should not have any other flags")
		}

		if (!taskName) {
			throw new Error("Missing <task> input")
		}
	}

	if (!taskName && !init && !build && !test && !debug) {
		await commands.listTasks(cwd)
	} else if (!taskName && init && !build && !test && !debug) {
		await commands.initProject(cwd)
	} else if (taskName && !init && !build && !test && !debug) {
		await commands.runTask(cwd, taskName)
	} else if (taskName && build && !init && !test && !debug) {
		await commands.buildTask(cwd, taskName)
	} else if (taskName && test && !init && !build && !debug) {
		await commands.testTask(cwd, taskName)
	} else if (taskName && test && build && !init && !debug) {
		// Allow unnecessary --build
		await commands.testTask(cwd, taskName)
	} else if (taskName && debug && !init && !build && !test) {
		await commands.debugTask(cwd, taskName)
	} else if (taskName && debug && test && !init && !build) {
		await commands.debugTaskTests(cwd, taskName)
	} else if (taskName && debug && test && build && !init) {
		// Allow unnecessary --build
		await commands.debugTaskTests(cwd, taskName)
	} else if (taskName && build && debug && !init && !test) {
		await commands.buildAndDebugTask(cwd, taskName)
	} else {
		throw new Error("Unexpected set of flags")
	}
}

let argv = process.argv.slice(2)
let finalError: null | Error = null

println("{dim %s ({magenta v%s})}", ["naw", ...argv].join(" "), cli.pkg.version)

main(process.cwd(), cli.input, cli.flags)
	.catch(err => {
		finalError = err

		if (err instanceof ProcessError && err.code === 1) {
			return
		}

		let [type] = err.stack.match(ERROR_TYPE_REGEX)
		let message = replaceAll(err.message, /"(.*?)"/g, chalk.cyan('"$1"'))
		let stack = chalk.italic(extractStack(err))

		println("")
		println("{bold.red %s}{bold %s}\n{dim %s}", type, message, stack)
		println("")
	})
	.then(() => {
		let endTime = Date.now()
		let duration = (endTime - startTime) / 1000
		let rounded = Math.round(duration * 100) / 100

		if (!finalError) {
			println("{dim %s ({cyan %ds})}", ["naw", ...argv].join(" "), rounded)
			process.exit(0)
			return
		}

		println("{dim %s ({red %ds})}", ["naw", ...argv].join(" "), rounded)

		if (!(finalError instanceof ProcessError)) {
			process.exit(2)
			return
		}

		if (finalError.signal) {
			process.kill(process.pid, finalError.signal)
		} else {
			process.exit(finalError.code)
		}
	})
