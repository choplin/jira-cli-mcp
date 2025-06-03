import { describe, expect, test, mock } from "bun:test";
import { listTickets } from "../src/tools/listTickets";

const isIntegrationTest = process.env.INTEGRATION_TEST === "true";

const isJiraAvailable = async (): Promise<boolean> => {
  try {
    const { executeJiraCommand } = await import("../src/utils/jiraExecutor");
    const result = await executeJiraCommand(["version"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
};

const shouldRunIntegrationTests = isIntegrationTest && await isJiraAvailable();

describe("listTickets", () => {
  // Mock tests using recorded output
  describe("unit tests (mocked)", () => {
    test("should parse jira issue list output correctly", async () => {
      // Recorded output from: jira issue list --jql "assignee = currentUser()" --plain --no-headers --columns "key,summary,status,priority,type,assignee" --paginate 0:3
      const mockOutput = `ABC-12345	Implement authentication service				Open	High	Story		John Smith
ABC-12346	Fix memory leak in background processor	Open	Medium	Bug		John Smith
ABC-12347	Add validation for user input fields		Open	Low	Task	Jane Doe`;

      const mockExecuteJiraCommand = mock(async () => ({
        stdout: mockOutput,
        stderr: "",
        exitCode: 0,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const result = await listTickets({
        jql: "assignee = currentUser()",
        limit: 3,
      });

      expect(result).toHaveProperty("tickets");
      expect(Array.isArray(result.tickets)).toBe(true);
      expect(result.tickets).toHaveLength(3);

      const ticket = result.tickets[0];
      expect(ticket.key).toBe("ABC-12345");
      expect(ticket.summary).toBe("Implement authentication service");
      expect(ticket.status).toBe("Open");
      expect(ticket.priority).toBe("High");
      expect(ticket.type).toBe("Story");
      expect(ticket.assignee).toBe("John Smith");
    });

    test("should handle empty results gracefully", async () => {
      // Recorded output for empty results
      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "",
        stderr: "✗ No result found for given query in project \"TEST\"",
        exitCode: 1,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const result = await listTickets({
        jql: "summary ~ 'ThisShouldNotExistAnywhere12345'",
        limit: 10,
      });

      expect(result).toHaveProperty("tickets");
      expect(Array.isArray(result.tickets)).toBe(true);
      expect(result.tickets).toHaveLength(0);
    });

    test("should handle command without JQL parameter", async () => {
      // Recorded output from: jira issue list --plain --no-headers --columns "key,summary,status,priority,type,assignee" --paginate 0:2
      const mockOutput = `ABC-12345	Implement authentication service				Open	High	Story		John Smith
ABC-12346	Fix memory leak in background processor	Open	Medium	Bug		John Smith`;

      const mockExecuteJiraCommand = mock(async () => ({
        stdout: mockOutput,
        stderr: "",
        exitCode: 0,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const result = await listTickets({});

      expect(result).toHaveProperty("tickets");
      expect(Array.isArray(result.tickets)).toBe(true);
      expect(result.tickets).toHaveLength(2);
    });
  });

  // Integration tests (only run when INTEGRATION_TEST=true and jira-cli is available)
  describe.skipIf(!shouldRunIntegrationTests)("integration tests", () => {
    test("should work with real jira-cli", async () => {
      const result = await listTickets({
        jql: "assignee = currentUser()",
        limit: 3,
      });

      expect(result).toHaveProperty("tickets");
      expect(Array.isArray(result.tickets)).toBe(true);

      // Verify structure of tickets if any are returned
      if (result.tickets.length > 0) {
        const ticket = result.tickets[0];
        expect(ticket).toHaveProperty("key");
        expect(ticket).toHaveProperty("summary");
        expect(ticket).toHaveProperty("status");
        expect(ticket).toHaveProperty("priority");
        expect(ticket).toHaveProperty("type");
        
        expect(typeof ticket.key).toBe("string");
        expect(typeof ticket.summary).toBe("string");
        expect(typeof ticket.status).toBe("string");
        expect(typeof ticket.priority).toBe("string");
        expect(typeof ticket.type).toBe("string");
      }
    });

    test("should handle custom JQL query with real jira-cli", async () => {
      const result = await listTickets({
        jql: "project IS NOT EMPTY",
        limit: 2,
      });

      expect(result).toHaveProperty("tickets");
      expect(Array.isArray(result.tickets)).toBe(true);
      expect(result.tickets.length).toBeLessThanOrEqual(2);
    });
  });
});