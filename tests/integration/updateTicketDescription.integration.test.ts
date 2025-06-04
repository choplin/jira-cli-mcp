import { describe, expect, test } from "bun:test";
import { getTicket } from "../../src/tools/getTicket";
import { listTickets } from "../../src/tools/listTickets";
import { updateTicketDescription } from "../../src/tools/updateTicketDescription";

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
  "updateTicketDescription integration tests",
  () => {
    test.skipIf(!process.env.JIRA_CLI_MCP_TEST_TICKET)(
      "should update ticket description with real jira-cli",
      async () => {
        const ticketKey = process.env.JIRA_CLI_MCP_TEST_TICKET as string;

        // Get original description
        const originalTicket = await getTicket({ ticketKey, comments: 0 });
        const originalDescription = originalTicket.description;

        // Update with test description
        const testDescription = `Test description updated at ${new Date().toISOString()}\n\nThis is a test update from the MCP integration tests.`;

        const result = await updateTicketDescription({
          ticketKey,
          description: testDescription,
        });

        expect(result.success).toBe(true);
        expect(result.ticketKey).toBe(ticketKey);

        // Verify the update
        const updatedTicket = await getTicket({ ticketKey, comments: 0 });
        expect(updatedTicket.description).toBe(testDescription);

        // Restore original description if it existed
        if (originalDescription) {
          await updateTicketDescription({
            ticketKey,
            description: originalDescription,
          });
        }
      },
    );

    test("should handle permission errors with real jira-cli", async () => {
      // Try to update a ticket that doesn't exist
      await expect(
        updateTicketDescription({
          ticketKey: "NONEXISTENT-999999",
          description: "This should fail",
        }),
      ).rejects.toThrow();
    });
  },
);
