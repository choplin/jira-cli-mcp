import { describe, expect, test, beforeEach } from "bun:test";
import { executeJiraCommand, executeJiraCommandJson, JiraCliError } from "../src/utils/jiraExecutor";

describe("jiraExecutor", () => {
  const isJiraAvailable = async (): Promise<boolean> => {
    try {
      const result = await executeJiraCommand(["version"]);
      return result.exitCode === 0;
    } catch {
      return false;
    }
  };

  beforeEach(() => {
    // Reset environment variables
    delete process.env.JIRA_CLI_PATH;
  });

  describe("executeJiraCommand", () => {
    test("should handle jira-cli not found error", async () => {
      // Set invalid path
      process.env.JIRA_CLI_PATH = "/invalid/path/to/jira";
      
      try {
        await executeJiraCommand(["version"]);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(JiraCliError);
        expect((error as JiraCliError).message).toContain("jira-cli not found");
      }
    });

    test("should execute help command", async () => {
      const jiraAvailable = await isJiraAvailable();
      if (!jiraAvailable) {
        console.log("Skipping test: jira-cli not available");
        return;
      }

      const result = await executeJiraCommand(["--help"]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("jira");
    });

    test("should handle invalid command", async () => {
      const jiraAvailable = await isJiraAvailable();
      if (!jiraAvailable) {
        console.log("Skipping test: jira-cli not available");
        return;
      }

      const result = await executeJiraCommand(["invalid-command"]);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr.length).toBeGreaterThan(0);
    });
  });

  describe("executeJiraCommandJson", () => {
    test("should throw error for non-JSON output commands", async () => {
      const jiraAvailable = await isJiraAvailable();
      if (!jiraAvailable) {
        console.log("Skipping test: jira-cli not available");
        return;
      }

      // --help doesn't produce JSON output
      await expect(executeJiraCommandJson(["--help"])).rejects.toThrow("Failed to parse jira output as JSON");
    });

    test("should throw JiraCliError on command failure", async () => {
      const jiraAvailable = await isJiraAvailable();
      if (!jiraAvailable) {
        console.log("Skipping test: jira-cli not available");
        return;
      }

      await expect(executeJiraCommandJson(["invalid-command"])).rejects.toThrow(JiraCliError);
    });
  });

  describe("environment variable handling", () => {
    test("should use default jira command when JIRA_CLI_PATH is not set", async () => {
      const jiraAvailable = await isJiraAvailable();
      if (!jiraAvailable) {
        console.log("Skipping test: jira-cli not available");
        return;
      }

      const result = await executeJiraCommand(["version"]);
      expect(result.exitCode).toBe(0);
    });

    test("should respect JIRA_CLI_PATH environment variable", async () => {
      // This test verifies the path is used, not that it works
      process.env.JIRA_CLI_PATH = "/custom/jira/path";
      
      try {
        await executeJiraCommand(["version"]);
      } catch (error) {
        expect(error).toBeInstanceOf(JiraCliError);
        expect((error as JiraCliError).message).toContain("/custom/jira/path");
      }
    });
  });
});