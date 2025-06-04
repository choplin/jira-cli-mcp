import { describe, expect, test, mock, afterEach } from "bun:test";

// Mock JiraCliError class for tests
class MockJiraCliError extends Error {
  constructor(message: string, public exitCode: number, public stderr: string) {
    super(message);
    this.name = "JiraCliError";
  }
}

describe("updateTicketDescription", () => {
  afterEach(() => {
    mock.restore();
  });

  // Mock tests using recorded output
  describe("unit tests (mocked)", () => {
    test("should update ticket description successfully", async () => {
      const mockExecuteJiraCommand = mock(async (args: string[]) => {
        expect(args).toEqual([
          "issue",
          "edit",
          "TEST-123",
          "--body",
          "This is the new description",
          "--no-input",
        ]);
        return {
          stdout: "✓ Issue TEST-123 has been updated",
          stderr: "",
          exitCode: 0,
        };
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { updateTicketDescription } = await import("../src/tools/updateTicketDescription");
      const result = await updateTicketDescription({
        ticketKey: "TEST-123",
        description: "This is the new description",
      });

      expect(result.success).toBe(true);
      expect(result.ticketKey).toBe("TEST-123");
      expect(result.message).toBe("Successfully updated description for TEST-123");
    });

    test("should handle multiline descriptions", async () => {
      const multilineDescription = `## Overview
This is a multi-line description.

### Details
- Point 1
- Point 2

### Acceptance Criteria
1. Do this
2. Do that`;

      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "✓ Issue TEST-456 has been updated",
        stderr: "",
        exitCode: 0,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { updateTicketDescription } = await import("../src/tools/updateTicketDescription");
      const result = await updateTicketDescription({
        ticketKey: "TEST-456",
        description: multilineDescription,
      });

      expect(result.success).toBe(true);
      expect(result.ticketKey).toBe("TEST-456");
    });

    test("should handle jira command failure", async () => {
      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "",
        stderr: "✗ Unable to perform the operation: permission denied",
        exitCode: 1,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
        JiraCliError: MockJiraCliError,
      }));

      const { updateTicketDescription } = await import("../src/tools/updateTicketDescription");
      
      await expect(
        updateTicketDescription({
          ticketKey: "TEST-789",
          description: "New description",
        })
      ).rejects.toThrow("Failed to update ticket TEST-789");
    });

    test("should handle non-existent ticket", async () => {
      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "",
        stderr: "Issue TEST-999 does not exist or you do not have permission to see it.",
        exitCode: 1,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
        JiraCliError: MockJiraCliError,
      }));

      const { updateTicketDescription } = await import("../src/tools/updateTicketDescription");

      await expect(
        updateTicketDescription({
          ticketKey: "TEST-999",
          description: "This won't work",
        })
      ).rejects.toThrow("Failed to update ticket TEST-999");
    });
  });
});