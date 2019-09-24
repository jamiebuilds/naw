import crossSpawn from "cross-spawn"
import readline from "readline"
import chalk from "chalk"

export enum Mode {
	Silent,
	Quiet,
	Loud,
}

export interface SpawnOptions {
	mode: Mode
	interactive: boolean
}

export class ProcessError extends Error {
	code?: number
	signal?: string
	constructor(code?: number, signal?: string) {
		super(`Child process failed (code: ${code}, signal: ${signal})`)
		this.code = code
		this.signal = signal
	}
}

function createOutputStream(mode: Mode) {
	let firstWrite = true

	function write(buffer: Buffer, kind: "stdout" | "stderr") {
		if (mode === Mode.Quiet) {
			let lines = buffer
				.toString()
				.trim()
				.split("\n")
			let latest = lines[lines.length - 1]
			if (firstWrite) {
				firstWrite = false
			} else {
				readline.clearLine(process.stdout, 0)
				readline.cursorTo(process.stdout, 0)
			}
			if (kind === "stderr") {
				process.stdout.write(chalk.red(latest))
			} else {
				process.stdout.write(chalk.dim(latest))
			}
		}
	}

	function end() {
		if (mode === Mode.Quiet) {
			if (!firstWrite) {
				readline.clearLine(process.stdout, 0)
				readline.cursorTo(process.stdout, 0)
			}
		}
	}

	return { write, end }
}

export default function spawn(cmd: string, args: string[], opts: SpawnOptions) {
	return new Promise((resolve, reject) => {
		let buffer = Buffer.from("")
		let child = crossSpawn(cmd, args, {
			stdio: opts.mode === Mode.Loud ? "inherit" : "pipe",
			shell: opts.interactive,
		})
		let outputStream = createOutputStream(opts.mode)

		if (child.stdout) {
			child.stdout.on("data", (data: Buffer) => {
				buffer = Buffer.concat([buffer, data])
				outputStream.write(data, "stdout")
			})
		}

		if (child.stderr) {
			child.stderr.on("data", (data: Buffer) => {
				buffer = Buffer.concat([buffer, data])
				outputStream.write(data, "stderr")
			})
		}

		child.on("error", (error: Error) => {
			outputStream.end()
			if (opts.mode !== Mode.Loud && buffer.length) {
				process.stderr.write(buffer)
			}
			reject(error)
		})

		child.on("exit", (code: number, signal: string) => {
			outputStream.end()
			if (code === 0) {
				return resolve()
			} else {
				if (opts.mode !== Mode.Loud && buffer.length) {
					console.log()
					process.stderr.write(buffer)
				}
				reject(new ProcessError(code, signal))
			}
		})
	})
}
