import { describe, expect, test, mock, afterEach } from "bun:test";


describe("listTickets", () => {
  afterEach(() => {
    // Note: mock.restore() doesn't restore module mocks in Bun
    // Module mocks persist across tests, so we organize tests accordingly
    mock.restore();
  });

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

      const { listTickets } = await import("../src/tools/listTickets");
      const result = await listTickets({
        jql: "assignee = currentUser()",
        limit: 3,
      });

      expect(result).toHaveProperty("tickets");
      expect(Array.isArray(result.tickets)).toBe(true);
      expect(result.tickets).toHaveLength(3);

      const ticket = result.tickets[0]!;
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

      const { listTickets } = await import("../src/tools/listTickets");
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

      const { listTickets } = await import("../src/tools/listTickets");
      const result = await listTickets({ limit: 20 });

      expect(result).toHaveProperty("tickets");
      expect(Array.isArray(result.tickets)).toBe(true);
      expect(result.tickets).toHaveLength(2);
    });
  });

});