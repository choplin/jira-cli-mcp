import { describe, expect, test } from "bun:test";
import { openTicketInBrowser } from "../../src/tools/openTicketInBrowser";

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
  "openTicketInBrowser integration tests",
  () => {
    test.skipIf(!process.env.JIRA_CLI_MCP_TEST_TICKET)(
      "should work with real jira-cli",
      async () => {
        // Use the ticket from environment variable
        const ticketKey = process.env.JIRA_CLI_MCP_TEST_TICKET as string;

        // Open the ticket in browser
        const result = await openTicketInBrowser({
          ticketKey: ticketKey,
        });

        // Verify result structure
        expect(result).toHaveProperty("message");
        expect(result.message).toBe(
          `Successfully opened ticket ${ticketKey} in browser`,
        );
      },
    );

    test("should handle invalid ticket key with real jira-cli", async () => {
      // Note: jira open command might not always fail for invalid tickets
      // It may open the project page instead
      // This test verifies the command executes without errors
      const result = await openTicketInBrowser({
        ticketKey: "INVALID-999999",
      });

      expect(result).toHaveProperty("message");
      expect(result.message).toContain("Successfully opened");
    });
  },
);
