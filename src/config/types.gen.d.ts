import { Config } from "./types.src"

export declare class Convert {
	static toConfig(json: string): Config
	static configToJson(value: Config): string
}
