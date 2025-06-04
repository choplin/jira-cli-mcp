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

    test("should build JQL from semantic parameters - assignedToMe", async () => {
      const mockExecuteJiraCommand = mock(async (args: string[]) => {
        // Verify the JQL parameter
        const jqlIndex = args.indexOf("--jql");
        expect(jqlIndex).toBeGreaterThan(-1);
        expect(args[jqlIndex + 1]).toBe("assignee = currentUser()");
        
        return {
          stdout: "TEST-123\tTest Issue\tOpen\tHigh\tTask\tJohn Smith",
          stderr: "",
          exitCode: 0,
        };
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { listTickets } = await import("../src/tools/listTickets");
      const result = await listTickets({ assignedToMe: true });

      expect(result.tickets).toHaveLength(1);
      expect(mockExecuteJiraCommand).toHaveBeenCalled();
    });

    test("should build JQL from semantic parameters - status filter", async () => {
      const mockExecuteJiraCommand = mock(async (args: string[]) => {
        // Verify the JQL parameter
        const jqlIndex = args.indexOf("--jql");
        expect(jqlIndex).toBeGreaterThan(-1);
        expect(args[jqlIndex + 1]).toBe('status = "In Progress"');
        
        return {
          stdout: "TEST-456\tAnother Issue\tIn Progress\tMedium\tBug\tJane Doe",
          stderr: "",
          exitCode: 0,
        };
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { listTickets } = await import("../src/tools/listTickets");
      const result = await listTickets({ status: "in progress" });

      expect(result.tickets).toHaveLength(1);
      expect(result.tickets[0]!.status).toBe("In Progress");
    });

    test("should build JQL from multiple semantic parameters", async () => {
      const mockExecuteJiraCommand = mock(async (args: string[]) => {
        // Verify the JQL parameter
        const jqlIndex = args.indexOf("--jql");
        expect(jqlIndex).toBeGreaterThan(-1);
        const jql = args[jqlIndex + 1]!;
        expect(jql).toContain("assignee = currentUser()");
        expect(jql).toContain('status = "In Review"');
        expect(jql).toContain("project = PROJ");
        expect(jql).toContain("ORDER BY created DESC");
        
        return {
          stdout: "",
          stderr: "",
          exitCode: 0,
        };
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { listTickets } = await import("../src/tools/listTickets");
      const result = await listTickets({
        assignedToMe: true,
        status: "in review",
        project: "PROJ",
        orderBy: "created",
        orderDirection: "desc",
      });

      expect(result.tickets).toHaveLength(0);
      expect(mockExecuteJiraCommand).toHaveBeenCalled();
    });

    test("should handle date filters", async () => {
      const mockExecuteJiraCommand = mock(async (args: string[]) => {
        // Verify the JQL parameter
        const jqlIndex = args.indexOf("--jql");
        expect(jqlIndex).toBeGreaterThan(-1);
        const jql = args[jqlIndex + 1]!;
        expect(jql).toContain("created >= -7d");
        expect(jql).toContain("updated >= -7d");
        
        return {
          stdout: "",
          stderr: "",
          exitCode: 0,
        };
      });

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { listTickets } = await import("../src/tools/listTickets");
      await listTickets({
        createdRecently: true,
        updatedRecently: true,
      });

      expect(mockExecuteJiraCommand).toHaveBeenCalled();
    });
  });

});