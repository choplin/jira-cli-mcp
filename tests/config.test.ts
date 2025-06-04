import { beforeEach, describe, expect, test } from "bun:test";
import { getConfig } from "../src/config";

describe("config", () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.JIRA_CLI_PATH = undefined;
  });

  test("should return default jira path when no environment variable is set", () => {
    const config = getConfig();
    expect(config.jiraCliPath).toBe("jira");
  });

  test("should use JIRA_CLI_PATH environment variable when set", () => {
    process.env.JIRA_CLI_PATH = "/custom/path/to/jira";
    const config = getConfig();
    expect(config.jiraCliPath).toBe("/custom/path/to/jira");
  });

  test("should return consistent config object structure", () => {
    const config = getConfig();
    expect(config).toHaveProperty("jiraCliPath");
    expect(typeof config.jiraCliPath).toBe("string");
  });
});
