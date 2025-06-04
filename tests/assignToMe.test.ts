import { afterEach, describe, expect, mock, test } from "bun:test";

describe("assignToMe", () => {
  afterEach(() => {
    mock.restore();
  });

  // Mock tests using recorded output
  describe("unit tests (mocked)", () => {
    test("should assign ticket to current user successfully", async () => {
      const mockExecuteJiraCommand = mock((args: string[]) => {
        if (args[0] === "me") {
          return Promise.resolve({
            stdout: "test.user@example.com\n",
            stderr: "",
            exitCode: 0,
          });
        }
        if (args[0] === "issue" && args[1] === "assign") {
          expect(args).toEqual([
            "issue",
            "assign",
            "TEST-123",
            "test.user@example.com",
          ]);
          return Promise.resolve({
            stdout:
              "✓ Issue TEST-123 has been assigned to test.user@example.com",
            stderr: "",
            exitCode: 0,
          });
        }
        return Promise.resolve({
          stdout: "",
          stderr: "Unknown command",
          exitCode: 1,
        });
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { assignToMe } = await import("../src/tools/assignToMe");
      const result = await assignToMe({
        ticketKey: "TEST-123",
      });

      expect(result.success).toBe(true);
      expect(result.ticketKey).toBe("TEST-123");
      expect(result.assignee).toBe("test.user@example.com");
      expect(result.message).toBe(
        "Successfully assigned TEST-123 to test.user@example.com",
      );
    });

    test("should handle failure to get current user", async () => {
      const mockExecuteJiraCommand = mock((args: string[]) => {
        if (args[0] === "me") {
          return Promise.resolve({
            stdout: "",
            stderr: "Not authenticated",
            exitCode: 1,
          });
        }
        return Promise.resolve({ stdout: "", stderr: "", exitCode: 0 });
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { assignToMe } = await import("../src/tools/assignToMe");

      await expect(
        assignToMe({
          ticketKey: "TEST-456",
        }),
      ).rejects.toThrow("Failed to get current user");
    });

    test("should handle assignment failure", async () => {
      const mockExecuteJiraCommand = mock((args: string[]) => {
        if (args[0] === "me") {
          return Promise.resolve({
            stdout: "test.user@example.com\n",
            stderr: "",
            exitCode: 0,
          });
        }
        if (args[0] === "issue" && args[1] === "assign") {
          return Promise.resolve({
            stdout: "",
            stderr: "✗ Unable to perform the operation: permission denied",
            exitCode: 1,
          });
        }
        return Promise.resolve({ stdout: "", stderr: "", exitCode: 0 });
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { assignToMe } = await import("../src/tools/assignToMe");

      await expect(
        assignToMe({
          ticketKey: "TEST-789",
        }),
      ).rejects.toThrow("Failed to assign ticket TEST-789");
    });

    test("should handle non-existent ticket", async () => {
      const mockExecuteJiraCommand = mock((args: string[]) => {
        if (args[0] === "me") {
          return Promise.resolve({
            stdout: "test.user@example.com\n",
            stderr: "",
            exitCode: 0,
          });
        }
        if (args[0] === "issue" && args[1] === "assign") {
          return Promise.resolve({
            stdout: "",
            stderr:
              "Issue TEST-999 does not exist or you do not have permission to see it.",
            exitCode: 1,
          });
        }
        return Promise.resolve({ stdout: "", stderr: "", exitCode: 0 });
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { assignToMe } = await import("../src/tools/assignToMe");

      await expect(
        assignToMe({
          ticketKey: "TEST-999",
        }),
      ).rejects.toThrow("Failed to assign ticket TEST-999");
    });
  });
});
