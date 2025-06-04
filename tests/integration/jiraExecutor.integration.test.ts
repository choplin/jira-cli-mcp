import { describe, expect, test } from "bun:test";

const isIntegrationTest = process.env.INTEGRATION_TEST === "true";

const isJiraAvailable = async (): Promise<boolean> => {
  if (!isIntegrationTest) return false;
  try {
    const { executeJiraCommand } = await import("../../src/utils/jiraExecutor");
    const result = await executeJiraCommand(["version"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
};

const shouldRunIntegrationTests = isIntegrationTest && await isJiraAvailable();

describe.skipIf(!shouldRunIntegrationTests)("jiraExecutor integration tests", () => {
  test("should execute version command", async () => {
    const { executeJiraCommand } = await import("../../src/utils/jiraExecutor");
    const result = await executeJiraCommand(["version"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/); // Version pattern
  });

  test("should handle invalid command", async () => {
    const { executeJiraCommand } = await import("../../src/utils/jiraExecutor");
    const result = await executeJiraCommand(["invalid-command"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  test("should throw error for non-JSON output commands", async () => {
    const { executeJiraCommandJson } = await import("../../src/utils/jiraExecutor");
    // version doesn't produce JSON output
    await expect(executeJiraCommandJson(["version"])).rejects.toThrow("Failed to parse jira output as JSON");
  });

  test("should throw JiraCliError on command failure", async () => {
    const { executeJiraCommandJson, JiraCliError } = await import("../../src/utils/jiraExecutor");
    await expect(executeJiraCommandJson(["invalid-command"])).rejects.toThrow(JiraCliError);
  });

  test("should use default jira command when JIRA_CLI_PATH is not set", async () => {
    const { executeJiraCommand } = await import("../../src/utils/jiraExecutor");
    const result = await executeJiraCommand(["version"]);
    expect(result.exitCode).toBe(0);
  });
});