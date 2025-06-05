import { afterEach, describe, expect, mock, test } from "bun:test";

describe("openTicketInBrowser", () => {
  afterEach(() => {
    mock.restore();
  });

  // Mock tests using recorded output
  describe("unit tests (mocked)", () => {
    test("should successfully open ticket in browser", async () => {
      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "",
        stderr: "",
        exitCode: 0,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { openTicketInBrowser } = await import(
        "../src/tools/openTicketInBrowser"
      );
      const result = await openTicketInBrowser({
        ticketKey: "TEST-123",
      });

      expect(mockExecuteJiraCommand).toHaveBeenCalledWith(["open", "TEST-123"]);
      expect(result.message).toBe(
        "Successfully opened ticket TEST-123 in browser",
      );
    });

    test("should handle jira command failure", async () => {
      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "",
        stderr:
          "Issue TEST-999 does not exist or you do not have permission to see it.",
        exitCode: 1,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { openTicketInBrowser } = await import(
        "../src/tools/openTicketInBrowser"
      );
      await expect(
        openTicketInBrowser({
          ticketKey: "TEST-999",
        }),
      ).rejects.toThrow("Failed to open ticket TEST-999 in browser");
    });
  });
});
