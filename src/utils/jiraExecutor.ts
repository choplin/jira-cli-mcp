import { spawn } from "child_process";
import { getConfig } from "../config.js";
import type { CommandResult } from "./types.js";

export class JiraCliError extends Error {
  constructor(
    message: string,
    public exitCode: number,
    public stderr: string,
  ) {
    super(message);
    this.name = "JiraCliError";
  }
}

export async function executeJiraCommand(
  args: string[],
): Promise<CommandResult> {
  const config = getConfig();
  const jiraPath = config.jiraCliPath;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const errorChunks: Buffer[] = [];

    const proc = spawn(jiraPath, args, {
      env: { ...process.env },
    });

    proc.stdout.on("data", (chunk) => {
      chunks.push(chunk);
    });

    proc.stderr.on("data", (chunk) => {
      errorChunks.push(chunk);
    });

    proc.on("error", (error) => {
      // Node.js spawn errors include a 'code' property
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        reject(
          new JiraCliError(
            `jira-cli not found at path: ${jiraPath}. Please install jira-cli or set JIRA_CLI_PATH environment variable.`,
            -1,
            "",
          ),
        );
      } else {
        reject(error);
      }
    });

    proc.on("close", (code) => {
      const stdout = Buffer.concat(chunks).toString("utf-8");
      const stderr = Buffer.concat(errorChunks).toString("utf-8");
      const exitCode = code || 0;

      resolve({
        stdout,
        stderr,
        exitCode,
      });
    });
  });
}

export async function executeJiraCommandJson<T>(args: string[]): Promise<T> {
  // Note: jira-cli doesn't have a global --output json flag
  // Each command handles JSON output differently
  const result = await executeJiraCommand(args);

  if (result.exitCode !== 0) {
    throw new JiraCliError(
      `jira command failed: ${result.stderr}`,
      result.exitCode,
      result.stderr,
    );
  }

  try {
    return JSON.parse(result.stdout) as T;
  } catch (error) {
    // If JSON parsing fails, throw error with the actual output
    throw new Error(`Failed to parse jira output as JSON: ${result.stdout}`);
  }
}