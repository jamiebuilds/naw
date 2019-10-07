import * as Config from "./config"
import * as Tasks from "./tasks"
import * as Init from "./init"
import { Mode } from "./spawn"
import { println } from "./logger"

export async function listTasks(cwd: string) {
	let config = await Config.getConfig(cwd)
	println("")
	println("{bold Available tasks:}")
	println("")
	for (let task of config.tasks) {
		println("  {bold.cyan %s}  {dim %s}", task.taskName, task.taskDescription)
	}
	println("")
	println("{bold {magenta Tip!} To run a task:}")
	println("")
	println("  {magenta $} {bold naw {cyan <task>}}")
	println("")
	println("{bold {magenta Tip!} For more help:}")
	println("")
	println("  {magenta $} {bold naw --help}")
	println("")
}

export async function initProject(cwd: string) {
	await Init.initProject(cwd)
}

export async function runTask(cwd: string, taskName: string) {
	let config = await Config.getConfig(cwd)
	let task = Tasks.findTask(config, taskName)
	println("")
	try {
		await Tasks.runTask(task, Tasks.Target.Builder, config.dirname)
		println("")
	} catch (err) {
		if (err.code !== 1) {
			println("")
			println("{bold {magenta Tip!} You may need to build this task:}")
			println("")
			println("  {magenta $} {bold naw {cyan %s} --build}", taskName)
			println("")
			println("{bold {magenta Tip!} To debug the container:}")
			println("")
			println("  {magenta $} {bold naw {cyan %s} --debug} ", taskName)
		}
		throw err
	}
}

export async function buildAndRunTask(cwd: string, taskName: string) {
	let config = await Config.getConfig(cwd)
	let task = Tasks.findTask(config, taskName)
	println("")
	println("{bold.magenta [1/1]} {bold Building} {bold.cyan %s}", taskName)
	await Tasks.buildTask(task, Mode.Quiet, config.dirname)
	println("")
	try {
		await Tasks.runTask(task, Tasks.Target.Builder, config.dirname)
		println("")
	} catch (err) {
		if (err.code !== 1) {
			println("")
			println("{bold {magenta Tip!} You may need to build this task:}")
			println("")
			println("  {magenta $} {bold naw {cyan %s} --build}", taskName)
			println("")
			println("{bold {magenta Tip!} To debug the container:}")
			println("")
			println("  {magenta $} {bold naw {cyan %s} --debug} ", taskName)
		}
		throw err
	}
}

export async function buildTask(cwd: string, taskName: string) {
	let config = await Config.getConfig(cwd)
	let task = Tasks.findTask(config, taskName)
	println("")
	println("{bold.magenta [1/1]} {bold Building} {bold.cyan %s}", taskName)
	await Tasks.buildTask(task, Mode.Quiet, config.dirname)
	println("{bold.green [success]} {bold Built} {bold.cyan %s}", taskName)
	println("")
	println("{bold {magenta Tip!} To run this task:}")
	println("")
	println("  {magenta $} {bold naw {cyan %s}}", taskName)
	println("")
}

export async function testTask(cwd: string, taskName: string) {
	let config = await Config.getConfig(cwd)
	let task = Tasks.findTask(config, taskName)
	println("")
	println("{bold.magenta [1/2]} {bold Building {cyan %s} tests}", taskName)
	await Tasks.buildTaskTester(task, Mode.Quiet, config.dirname)
	println("{bold.magenta [2/2]} {bold Testing {cyan %s}}", taskName)
	println("")
	await Tasks.runTask(task, Tasks.Target.Tester, cwd)
	println("")
	println("{bold.green [success]} {bold Tested {cyan %s}}", taskName)
	println("")
}

export async function debugTask(cwd: string, taskName: string) {
	let config = await Config.getConfig(cwd)
	let task = Tasks.findTask(config, taskName)
	println("")
	await Tasks.shellTask(task, Tasks.Target.Builder, config.dirname)
	println("")
}

export async function debugTaskTests(cwd: string, taskName: string) {
	let config = await Config.getConfig(cwd)
	let task = Tasks.findTask(config, taskName)
	println("")
	println("{bold.magenta [1/1]} {bold Building {cyan %s} tests}", taskName)
	await Tasks.buildTaskTester(task, Mode.Quiet, config.dirname)
	println("")
	await Tasks.shellTask(task, Tasks.Target.Tester, config.dirname)
	println("")
}

export async function buildAndDebugTask(cwd: string, taskName: string) {
	let config = await Config.getConfig(cwd)
	let task = Tasks.findTask(config, taskName)
	println("")
	println("{bold.magenta [1/1]} {bold Building {cyan %s}}", taskName)
	await Tasks.buildTask(task, Mode.Quiet, config.dirname)
	println("")
	await Tasks.shellTask(task, Tasks.Target.Builder, config.dirname)
	println("")
}
