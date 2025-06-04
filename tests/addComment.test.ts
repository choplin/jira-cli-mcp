import { afterEach, describe, expect, mock, test } from "bun:test";

// Mock JiraCliError class for tests
class MockJiraCliError extends Error {
  constructor(
    message: string,
    public exitCode: number,
    public stderr: string,
  ) {
    super(message);
    this.name = "JiraCliError";
  }
}

describe("addComment", () => {
  afterEach(() => {
    mock.restore();
  });

  // Mock tests using recorded output
  describe("unit tests (mocked)", () => {
    test("should add comment successfully", async () => {
      const mockExecuteJiraCommand = mock(async (args: string[]) => {
        expect(args).toEqual([
          "issue",
          "comment",
          "add",
          "TEST-123",
          "This is a test comment",
          "--no-input",
        ]);
        return {
          stdout: "✓ Comment added to TEST-123",
          stderr: "",
          exitCode: 0,
        };
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { addComment } = await import("../src/tools/addComment");
      const result = await addComment({
        ticketKey: "TEST-123",
        comment: "This is a test comment",
      });

      expect(result.success).toBe(true);
      expect(result.ticketKey).toBe("TEST-123");
      expect(result.message).toBe("Successfully added comment to TEST-123");
    });

    test("should handle multiline comments", async () => {
      const multilineComment = `This is a multiline comment.

It has multiple paragraphs.

And supports **markdown** formatting!`;

      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "✓ Comment added to TEST-456",
        stderr: "",
        exitCode: 0,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { addComment } = await import("../src/tools/addComment");
      const result = await addComment({
        ticketKey: "TEST-456",
        comment: multilineComment,
      });

      expect(result.success).toBe(true);
      expect(result.ticketKey).toBe("TEST-456");
    });

    test("should handle jira command failure", async () => {
      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "",
        stderr: "✗ Unable to add comment: permission denied",
        exitCode: 1,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
        JiraCliError: MockJiraCliError,
      }));

      const { addComment } = await import("../src/tools/addComment");

      await expect(
        addComment({
          ticketKey: "TEST-789",
          comment: "This should fail",
        }),
      ).rejects.toThrow("Failed to add comment to TEST-789");
    });

    test("should handle non-existent ticket", async () => {
      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "",
        stderr:
          "Issue TEST-999 does not exist or you do not have permission to see it.",
        exitCode: 1,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
        JiraCliError: MockJiraCliError,
      }));

      const { addComment } = await import("../src/tools/addComment");

      await expect(
        addComment({
          ticketKey: "TEST-999",
          comment: "This won't work",
        }),
      ).rejects.toThrow("Failed to add comment to TEST-999");
    });
  });
});
