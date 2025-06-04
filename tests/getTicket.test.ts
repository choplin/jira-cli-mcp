import { describe, expect, test, mock, afterEach } from "bun:test";


describe("getTicket", () => {
  afterEach(() => {
    mock.restore();
  });

  // Mock tests using recorded output
  describe("unit tests (mocked)", () => {
    test("should parse jira issue view output correctly", async () => {
      // Recorded output from: jira issue view TICKET-123 --raw --comments 3
      const mockRawOutput = JSON.stringify({
        key: "TEST-123",
        fields: {
          summary: "Implement user authentication system",
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Need to implement OAuth2 authentication for the web application"
                  }
                ]
              }
            ]
          },
          status: { name: "In Progress" },
          priority: { name: "High" },
          issuetype: { name: "Story" },
          assignee: { displayName: "Jane Doe" },
          reporter: { displayName: "John Smith" },
          created: "2024-01-15T10:30:00.000+0000",
          updated: "2024-01-16T14:20:00.000+0000",
          comment: {
            comments: [
              {
                author: { displayName: "Jane Doe" },
                created: "2024-01-15T15:45:00.000+0000",
                body: "Started working on OAuth2 integration"
              },
              {
                author: { displayName: "John Smith" },
                created: "2024-01-16T09:15:00.000+0000",
                body: "Please prioritize Google OAuth provider first"
              }
            ]
          }
        }
      });

      const mockExecuteJiraCommand = mock(async () => ({
        stdout: mockRawOutput,
        stderr: "",
        exitCode: 0,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { getTicket } = await import("../src/tools/getTicket");
      const result = await getTicket({
        ticketKey: "TEST-123",
        comments: 3,
      });

      expect(result.key).toBe("TEST-123");
      expect(result.summary).toBe("Implement user authentication system");
      expect(result.description).toBe("Need to implement OAuth2 authentication for the web application");
      expect(result.status).toBe("In Progress");
      expect(result.priority).toBe("High");
      expect(result.type).toBe("Story");
      expect(result.assignee).toBe("Jane Doe");
      expect(result.reporter).toBe("John Smith");
      expect(result.created).toBe("2024-01-15T10:30:00.000+0000");
      expect(result.updated).toBe("2024-01-16T14:20:00.000+0000");
      expect(result.comments).toHaveLength(2);
      expect(result.comments[0]!.author).toBe("Jane Doe");
      expect(result.comments[0]!.body).toBe("Started working on OAuth2 integration");
    });

    test("should parse ticket with ADF format description", async () => {
      const mockRawOutput = JSON.stringify({
        key: "TEST-789",
        fields: {
          summary: "Test with ADF description",
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "First paragraph of description"
                  }
                ]
              },
              {
                type: "paragraph", 
                content: [
                  {
                    type: "text",
                    text: "Second paragraph with more details"
                  }
                ]
              }
            ]
          },
          status: { name: "In Progress" },
          priority: { name: "Medium" },
          issuetype: { name: "Task" },
          assignee: { displayName: "Test User" },
          reporter: { displayName: "Reporter User" },
          created: "2024-01-20T10:00:00.000+0000",
          updated: "2024-01-20T11:00:00.000+0000",
          comment: {
            comments: []
          }
        }
      });

      const mockExecuteJiraCommand = mock(async () => ({
        stdout: mockRawOutput,
        stderr: "",
        exitCode: 0,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { getTicket } = await import("../src/tools/getTicket");
      const result = await getTicket({
        ticketKey: "TEST-789",
        comments: 5,
      });

      expect(result.key).toBe("TEST-789");
      expect(result.summary).toBe("Test with ADF description");
      expect(result.description).toBe("First paragraph of description\n\nSecond paragraph with more details");
    });

    test("should handle ticket with no description or comments", async () => {
      const mockRawOutput = JSON.stringify({
        key: "TEST-456",
        fields: {
          summary: "Simple bug fix",
          description: null,
          status: { name: "Open" },
          priority: { name: "Low" },
          issuetype: { name: "Bug" },
          assignee: null,
          reporter: { displayName: "System User" },
          created: "2024-01-10T08:00:00.000+0000",
          updated: "2024-01-10T08:00:00.000+0000",
          comment: {
            comments: []
          }
        }
      });

      const mockExecuteJiraCommand = mock(async () => ({
        stdout: mockRawOutput,
        stderr: "",
        exitCode: 0,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { getTicket } = await import("../src/tools/getTicket");
      const result = await getTicket({
        ticketKey: "TEST-456",
        comments: 5,
      });

      expect(result.key).toBe("TEST-456");
      expect(result.summary).toBe("Simple bug fix");
      expect(result.description).toBe("");
      expect(result.assignee).toBeUndefined();
      expect(result.comments).toHaveLength(0);
    });

    test("should handle jira command failure", async () => {
      const mockExecuteJiraCommand = mock(async () => ({
        stdout: "",
        stderr: "Issue TEST-999 does not exist or you do not have permission to see it.",
        exitCode: 1,
      }));

      mock.module("../src/utils/jiraExecutor", () => ({
        executeJiraCommand: mockExecuteJiraCommand,
      }));

      const { getTicket } = await import("../src/tools/getTicket");
      await expect(getTicket({
        ticketKey: "TEST-999",
        comments: 3,
      })).rejects.toThrow("Failed to get ticket TEST-999");
    });
  });

});