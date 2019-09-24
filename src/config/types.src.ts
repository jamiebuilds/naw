/**
 * Configuration
 */
export interface Config {
	tasks: Tasks
}

/**
 * Task configuration.
 */
export interface Tasks {
	[taskName: string]: Task
}

/**
 * A task.
 */
export interface Task {
	description: TaskDescription
	build: TaskBuild | TaskBuildContext
	args?: TaskArgs
	environment?: TaskEnvironment
}

/**
 * A description of the task
 */
export type TaskDescription = string

/**
 * Configuration options that are applied at build time.
 */
export interface TaskBuild {
	context: TaskBuildContext
	dockerfile?: TaskBuildDockerfile
	args?: TaskBuildArgs
}

/**
 * A path to the build context.
 */
export type TaskBuildContext = string

/**
 * Alternate Dockerfile.
 */
export type TaskBuildDockerfile = string

/**
 * Add build arguments, which are environment variables accessible only during the build process.
 */
export type TaskBuildArgs = string[] | { [key: string]: string }

/**
 * Replace arguments to pass to the container.
 */
export type TaskArgs = string[]

/**
 * Add environment variables.
 */
export type TaskEnvironment = string[] | { [key: string]: string }
