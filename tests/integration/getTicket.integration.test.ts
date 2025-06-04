import { describe, expect, test } from "bun:test";
import { getTicket } from "../../src/tools/getTicket";

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
  "getTicket integration tests",
  () => {
    test.skipIf(!process.env.JIRA_CLI_MCP_TEST_TICKET)(
      "should work with real jira-cli",
      async () => {
        // Use the ticket from environment variable
        const ticketKey = process.env.JIRA_CLI_MCP_TEST_TICKET as string;

        // Get the ticket
        const result = await getTicket({
          ticketKey: ticketKey,
          comments: 5,
        });

        // Verify ticket data structure
        expect(result).toHaveProperty("key");
        expect(result).toHaveProperty("summary");
        expect(result).toHaveProperty("status");
        expect(result).toHaveProperty("priority");
        expect(result).toHaveProperty("type");
        expect(result).toHaveProperty("comments");
        expect(result).toHaveProperty("description");
        expect(result).toHaveProperty("assignee");
        expect(result).toHaveProperty("reporter");
        expect(result).toHaveProperty("created");
        expect(result).toHaveProperty("updated");

        // Verify data types
        expect(typeof result.key).toBe("string");
        expect(typeof result.summary).toBe("string");
        expect(typeof result.status).toBe("string");
        expect(typeof result.priority).toBe("string");
        expect(typeof result.type).toBe("string");
        expect(Array.isArray(result.comments)).toBe(true);

        // Verify specific values
        expect(result.key).toBe(ticketKey);

        // Verify description exists (we don't know its content)
        expect(result.description).toBeDefined();

        // Verify comments structure if any exist
        if (result.comments.length > 0) {
          const firstComment = result
            .comments[0] as (typeof result.comments)[0];
          expect(firstComment).toHaveProperty("author");
          expect(firstComment).toHaveProperty("body");
          expect(firstComment).toHaveProperty("created");
        }
      },
    );

    test("should handle invalid ticket key with real jira-cli", async () => {
      await expect(
        getTicket({
          ticketKey: "INVALID-999999",
          comments: 1,
        }),
      ).rejects.toThrow("Failed to get ticket INVALID-999999");
    });
  },
);
