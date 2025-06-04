import { describe, expect, test } from "bun:test";
import { assignToMe } from "../../src/tools/assignToMe";
import { getTicket } from "../../src/tools/getTicket";
import { executeJiraCommand } from "../../src/utils/jiraExecutor";

const isIntegrationTest = process.env.INTEGRATION_TEST === "true";

const isJiraAvailable = async (): Promise<boolean> => {
  try {
    const result = await executeJiraCommand(["version"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
};

const shouldRunIntegrationTests = isIntegrationTest && await isJiraAvailable();

describe.skipIf(!shouldRunIntegrationTests)("assignToMe integration tests", () => {
  test.skipIf(!process.env.JIRA_CLI_MCP_TEST_TICKET)("should assign ticket to current user with real jira-cli", async () => {
    // Use the ticket from environment variable
    const ticketKey = process.env.JIRA_CLI_MCP_TEST_TICKET!;
    
    // Get current user
    const meResult = await executeJiraCommand(["me"]);
    const currentUser = meResult.stdout.trim();
    
    // Assign to me
    const result = await assignToMe({ ticketKey });

    expect(result.success).toBe(true);
    expect(result.ticketKey).toBe(ticketKey);
    expect(result.assignee).toBe(currentUser);
    
    // Verify the assignment by fetching the ticket
    const ticket = await getTicket({ ticketKey, comments: 0 });
    expect(ticket.assignee).toBe("Akihiro Okuno"); // Display name in ticket view
  });

  test("should handle permission errors with real jira-cli", async () => {
    // Try to assign a non-existent ticket
    await expect(
      assignToMe({
        ticketKey: "NONEXISTENT-999999",
      })
    ).rejects.toThrow();
  });
});