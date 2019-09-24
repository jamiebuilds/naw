import path from "path"
import fs from "fs"
import { promisify } from "util"
import { Convert } from "./config/types.gen"
import { Config, Tasks, Task, TaskBuild } from "./config/types.src"
import findUp from "find-up"

let readFile = promisify(fs.readFile)

export interface FinalConfig {
	dirname: string
	tasks: FinalTask[]
}

export interface FinalTaskBuild {
	buildContext: string
	buildDockerfile?: string
	buildArgs: string[]
}

export interface FinalTask extends FinalTaskBuild {
	taskName: string
	taskDescription: string
	environment: string[]
	args: string[]
}

export async function getConfig(cwd: string): Promise<FinalConfig> {
	let configPath = await findConfig(cwd)
	let config = await readConfig(configPath)
	return config
}

export async function findConfig(cwd: string): Promise<string> {
	let found = await findUp(["naw.json"], { cwd })
	if (!found) {
		throw new Error("Could not find naw.json from current directory")
	}
	return found
}

export async function readConfig(configPath: string): Promise<FinalConfig> {
	let dirname = path.dirname(configPath)
	let configFile = await readFile(configPath, "utf-8")
	let config = Convert.toConfig(configFile)
	return toFinalConfig(dirname, config)
}

function toFinalConfig(dirname: string, config: Config): FinalConfig {
	return { dirname, tasks: toFinalTasks(dirname, config.tasks) }
}

function toFinalTasks(dirname: string, tasks: Tasks): FinalTask[] {
	return Object.keys(tasks).map(taskName => {
		return toFinalTask(dirname, taskName, tasks[taskName])
	})
}

function toFinalTask(dirname: string, taskName: string, task: Task): FinalTask {
	return {
		taskName,
		taskDescription: task.description,
		...toFinalTaskBuild(dirname, task.build),
		environment: toArrayOfKeyValuePairs(task.environment),
		args: task.args || [],
	}
}

function toFinalTaskBuild(
	dirname: string,
	build: string | TaskBuild,
): FinalTaskBuild {
	if (typeof build === "string") {
		return {
			buildContext: path.resolve(dirname, build),
			buildArgs: [],
		}
	} else {
		return {
			buildContext: path.resolve(dirname, build.context),
			buildDockerfile: build.dockerfile,
			buildArgs: toArrayOfKeyValuePairs(build.args),
		}
	}
}

function toArrayOfKeyValuePairs(
	input: undefined | string[] | { [key: string]: string },
): string[] {
	if (typeof input === "undefined") {
		return []
	} else if (Array.isArray(input)) {
		return input
	} else {
		return Object.keys(input).map(key => `${key}=${input[key]}`)
	}
}
