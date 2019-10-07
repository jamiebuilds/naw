import spawn, { ProcessError, Mode } from "./spawn"
import { FinalConfig, FinalTask } from "./config"
import path from "path"

let DOCKERFILES = path.resolve(__dirname, "dockerfiles")
let TESTER_DOCKERFILE = path.join(DOCKERFILES, "tester.Dockerfile")

export enum Target {
	Builder = "builder",
	Tester = "tester",
}

export function findTask(config: FinalConfig, taskName: string): FinalTask {
	let found = config.tasks.find(task => task.taskName === taskName)
	if (!found) {
		throw new Error(`Could not find a task named "${taskName}"`)
	}
	return found
}

export async function buildTask(task: FinalTask, mode: Mode, cwd: string) {
	await spawn(
		"docker",
		[
			"build",
			task.buildContext,
			`--build-arg=cwd=${cwd}`,
			...task.buildArgs.map(buildArg => {
				return `--build-arg=${buildArg}`
			}),
			`--tag=${getTag(task, Target.Builder)}`,
		],
		{
			interactive: false,
			mode,
		},
	)
}

export async function buildTaskTester(
	task: FinalTask,
	mode: Mode,
	cwd: string,
) {
	await buildTask(task, mode, cwd)
	await spawn(
		"docker",
		[
			"build",
			task.buildContext,
			`--file=${TESTER_DOCKERFILE}`,
			`--build-arg=baseImage=${getTag(task, Target.Builder)}`,
			`--build-arg=testFiles=${getTestFilesGlob(task)}`,
			`--tag=${getTag(task, Target.Tester)}`,
		],
		{
			interactive: false,
			mode,
		},
	)
}

export async function runTask(task: FinalTask, target: Target, cwd: string) {
	await spawn(
		"docker",
		[
			"run",
			`--name=${task.taskName}`,
			"--rm",
			"--network=host",
			...(target === Target.Builder ? ["--interactive"] : []),
			"--tty",
			...(target === Target.Builder ? [`--volume=${cwd}:/workdir`] : []),
			getTag(task, target),
			...(target === Target.Builder ? task.args : []),
		],
		{
			interactive: true,
			mode: Mode.Loud,
		},
	)
}

export async function shellTask(task: FinalTask, target: Target, cwd: string) {
	try {
		await spawn(
			"docker",
			[
				"run",
				`--name=${task.taskName}`,
				"--rm",
				"--interactive",
				"--tty",
				"--network=host",
				...(target === Target.Builder ? [`--volume=${cwd}:/workdir`] : []),
				"--entrypoint=/bin/bash",
				getTag(task, target),
			],
			{
				interactive: true,
				mode: Mode.Loud,
			},
		)
	} catch (err) {
		if (err instanceof ProcessError && err.code === 130) {
			return
		} else {
			throw err
		}
	}
}

function getTag(task: FinalTask, target: Target) {
	return `naw-${target}-${task.taskName}:latest`
}

function getTestFilesGlob(task: FinalTask) {
	return path.join(task.buildContext, "*.bats")
}
