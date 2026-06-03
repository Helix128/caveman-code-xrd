import { execFile } from "node:child_process";

export interface GitExecOptions {
	cwd: string;
	timeoutMs?: number;
	maxBuffer?: number;
}

export interface GitExecResult {
	stdout: string;
	stderr: string;
	code: number | null;
}

export function gitExec(args: string[], options: GitExecOptions): Promise<GitExecResult> {
	return new Promise((resolve, reject) => {
		execFile(
			"git",
			["--no-optional-locks", ...args],
			{
				cwd: options.cwd,
				timeout: options.timeoutMs ?? 1500,
				maxBuffer: options.maxBuffer ?? 64 * 1024,
				encoding: "utf-8",
			},
			(error, stdout, stderr) => {
				if (error && "code" in error && typeof error.code !== "number") {
					reject(error);
					return;
				}
				resolve({
					stdout: stdout.trim(),
					stderr: stderr.trim(),
					code: error && "code" in error && typeof error.code === "number" ? error.code : 0,
				});
			},
		);
	});
}

export async function gitOutput(args: string[], options: GitExecOptions): Promise<string> {
	try {
		const result = await gitExec(args, options);
		return result.code === 0 ? result.stdout : "";
	} catch {
		return "";
	}
}
