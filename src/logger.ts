import util from "util"
import chalk from "chalk"

export function println(message: string, ...values: unknown[]) {
	let formatted = util.format(message, ...values)
	let template: any = [formatted] // eslint-disable-line @typescript-eslint/no-explicit-any
	template.raw = template
	let colorized = chalk(template as TemplateStringsArray)
	process.stdout.write(colorized + "\n")
}
