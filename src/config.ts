import type { Config } from "./utils/types.js";

export function getConfig(): Config {
  const jiraCliPath = process.env.JIRA_CLI_PATH || "jira";

  return {
    jiraCliPath,
  };
}
