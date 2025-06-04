import { describe, expect, test } from "bun:test";
import { listTickets } from "../../src/tools/listTickets";

const isIntegrationTest = process.env.INTEGRATION_TEST === "true";

const isJiraAvailable = async (): Promise<boolean> => {
  try {
    const { executeJiraCommand } = await import("../../src/utils/jiraExecutor");
    const result = await executeJiraCommand(["version"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
};

const shouldRunIntegrationTests =
  isIntegrationTest && (await isJiraAvailable());

describe.skipIf(!shouldRunIntegrationTests)(
  "listTickets integration tests",
  () => {
    test("should work with real jira-cli", async () => {
      const result = await listTickets({
        jql: "assignee = currentUser()",
        limit: 3,
      });

      expect(result).toHaveProperty("tickets");
      expect(Array.isArray(result.tickets)).toBe(true);

      // Verify structure of tickets if any are returned
      if (result.tickets.length > 0) {
        const ticket = result.tickets[0] as (typeof result.tickets)[0];
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
  },
);
