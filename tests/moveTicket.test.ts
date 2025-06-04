import { afterEach, describe, expect, mock, test } from "bun:test";

describe("moveTicket", () => {
  afterEach(() => {
    mock.restore();
  });

  // Mock tests using recorded output
  describe("unit tests (mocked)", () => {
    test("should move ticket to new status successfully", async () => {
      const mockExecuteJiraCommand = mock((args: string[]) => {
        if (args[0] === "issue" && args[1] === "list") {
          expect(args).toEqual([
            "issue",
            "list",
            "--jql",
            "key = TEST-123",
            "--plain",
            "--no-headers",
            "--columns",
            "status",
          ]);
          return Promise.resolve({
            stdout: "Open\n",
            stderr: "",
            exitCode: 0,
          });
        }
        if (args[0] === "issue" && args[1] === "move") {
          expect(args).toEqual(["issue", "move", "TEST-123", "In Progress"]);
          return Promise.resolve({
            stdout: "✓ Issue TEST-123 has been moved to In Progress",
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

      const { moveTicket } = await import("../src/tools/moveTicket");
      const result = await moveTicket({
        ticketKey: "TEST-123",
        status: "in progress",
      });

      expect(result.success).toBe(true);
      expect(result.ticketKey).toBe("TEST-123");
      expect(result.previousStatus).toBe("Open");
      expect(result.newStatus).toBe("In Progress");
      expect(result.message).toBe(
        "Successfully moved TEST-123 from Open to In Progress",
      );
    });

    test("should handle failure to get current status", async () => {
      const mockExecuteJiraCommand = mock((args: string[]) => {
        if (args[0] === "issue" && args[1] === "list") {
          return Promise.resolve({
            stdout: "",
            stderr:
              "Issue does not exist or you do not have permission to see it",
            exitCode: 1,
          });
        }
        return Promise.resolve({ stdout: "", stderr: "", exitCode: 0 });
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { moveTicket } = await import("../src/tools/moveTicket");

      await expect(
        moveTicket({
          ticketKey: "TEST-999",
          status: "done",
        }),
      ).rejects.toThrow("Failed to get current status");
    });

    test("should handle invalid transition", async () => {
      const mockExecuteJiraCommand = mock((args: string[]) => {
        if (args[0] === "issue" && args[1] === "list") {
          return Promise.resolve({
            stdout: "Done\n",
            stderr: "",
            exitCode: 0,
          });
        }
        if (args[0] === "issue" && args[1] === "move") {
          return Promise.resolve({
            stdout: "",
            stderr: "✗ Invalid transition from Done to Open",
            exitCode: 1,
          });
        }
        return Promise.resolve({ stdout: "", stderr: "", exitCode: 0 });
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { moveTicket } = await import("../src/tools/moveTicket");

      await expect(
        moveTicket({
          ticketKey: "TEST-123",
          status: "open",
        }),
      ).rejects.toThrow("Failed to move ticket TEST-123");
    });

    test("should handle status mapping correctly", async () => {
      const mockExecuteJiraCommand = mock((args: string[]) => {
        if (args[0] === "issue" && args[1] === "list") {
          return Promise.resolve({
            stdout: "To Do\n",
            stderr: "",
            exitCode: 0,
          });
        }
        if (args[0] === "issue" && args[1] === "move") {
          expect(args[3]).toBe("In Review"); // Verify status mapping
          return Promise.resolve({
            stdout: "✓ Issue TEST-456 has been moved to In Review",
            stderr: "",
            exitCode: 0,
          });
        }
        return Promise.resolve({ stdout: "", stderr: "", exitCode: 0 });
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { moveTicket } = await import("../src/tools/moveTicket");

      const result = await moveTicket({
        ticketKey: "TEST-456",
        status: "in review",
      });

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe("In Review");
    });
  });
});
