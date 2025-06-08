import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createTicket } from "../../src/tools/createTicket.js";
import { executeJiraCommand } from "../../src/utils/jiraExecutor.js";

const shouldRunIntegrationTests = process.env.INTEGRATION_TEST === "true";
const testTicket = process.env.JIRA_CLI_MCP_TEST_TICKET;

describe.skipIf(!shouldRunIntegrationTests)(
  "createTicket integration tests",
  () => {
    let createdTickets: string[] = [];

    afterEach(async () => {
      // Clean up created tickets by adding a comment
      for (const ticketKey of createdTickets) {
        try {
          await executeJiraCommand([
            "issue",
            "comment",
            "add",
            ticketKey,
            "--comment",
            "[Integration Test] This ticket was created by automated tests and can be deleted",
          ]);
        } catch (error) {
          console.error(`Failed to comment on ${ticketKey}:`, error);
        }
      }
      createdTickets = [];
    });

    test("creates a ticket with minimal parameters", async () => {
      // First get project key from test ticket
      const testResult = await executeJiraCommand([
        "issue",
        "view",
        testTicket || "PROJ-1",
        "--raw",
      ]);
      const testTicketData = JSON.parse(testResult.stdout);
      const projectKey = testTicketData.fields.project.key;

      const result = await createTicket({
        project: projectKey,
        type: "Task",
        summary: "[Integration Test] Minimal ticket creation test",
      });

      expect(result.success).toBe(true);
      expect(result.ticketKey).toBeTruthy();
      expect(result.ticketUrl).toBeTruthy();

      if (result.ticketKey) {
        createdTickets.push(result.ticketKey);

        // Verify the ticket was created
        const verifyResult = await executeJiraCommand([
          "issue",
          "view",
          result.ticketKey,
          "--raw",
        ]);
        const ticketData = JSON.parse(verifyResult.stdout);

        expect(ticketData.key).toBe(result.ticketKey);
        expect(ticketData.fields.summary).toBe(
          "[Integration Test] Minimal ticket creation test",
        );
        expect(ticketData.fields.issuetype.name).toBe("Task");
      }
    });

    test("creates a ticket with all parameters", async () => {
      // First get project key and current user
      const testResult = await executeJiraCommand([
        "issue",
        "view",
        testTicket || "PROJ-1",
        "--raw",
      ]);
      const testTicketData = JSON.parse(testResult.stdout);
      const projectKey = testTicketData.fields.project.key;

      const meResult = await executeJiraCommand(["me"]);
      const currentUser = meResult.stdout.trim();

      const result = await createTicket({
        project: projectKey,
        type: "Bug",
        summary: "[Integration Test] Full ticket creation test",
        description:
          "This is a test ticket created by integration tests.\n\nIt includes:\n- Multiple lines\n- Markdown formatting\n- **Bold text**",
        priority: "Low",
        assignee: currentUser,
        labels: ["integration-test", "automated"],
      });

      expect(result.success).toBe(true);
      expect(result.ticketKey).toBeTruthy();
      expect(result.ticketUrl).toBeTruthy();

      if (result.ticketKey) {
        createdTickets.push(result.ticketKey);

        // Verify the ticket was created with all fields
        const verifyResult = await executeJiraCommand([
          "issue",
          "view",
          result.ticketKey,
          "--raw",
        ]);
        const ticketData = JSON.parse(verifyResult.stdout);

        expect(ticketData.key).toBe(result.ticketKey);
        expect(ticketData.fields.summary).toBe(
          "[Integration Test] Full ticket creation test",
        );
        expect(ticketData.fields.issuetype.name).toBe("Bug");
        expect(ticketData.fields.priority.name).toBe("Low");
        expect(ticketData.fields.assignee?.displayName).toBeTruthy();
        expect(ticketData.fields.labels).toContain("integration-test");
        expect(ticketData.fields.labels).toContain("automated");
      }
    });

    test("handles invalid project gracefully", async () => {
      const result = await createTicket({
        project: "INVALID_PROJECT_KEY_123",
        type: "Task",
        summary: "[Integration Test] This should fail",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.ticketKey).toBeUndefined();
    });

    test("handles invalid issue type gracefully", async () => {
      // First get project key from test ticket
      const testResult = await executeJiraCommand([
        "issue",
        "view",
        testTicket || "PROJ-1",
        "--raw",
      ]);
      const testTicketData = JSON.parse(testResult.stdout);
      const projectKey = testTicketData.fields.project.key;

      const result = await createTicket({
        project: projectKey,
        type: "InvalidIssueType",
        summary: "[Integration Test] This should fail",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.ticketKey).toBeUndefined();
    });
  },
);
