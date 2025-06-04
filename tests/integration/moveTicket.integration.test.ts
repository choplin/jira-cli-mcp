import { describe, expect, test } from "bun:test";
import { getTicket } from "../../src/tools/getTicket";
import { moveTicket } from "../../src/tools/moveTicket";
import { executeJiraCommand } from "../../src/utils/jiraExecutor";
import type { JiraStatusValue } from "../../src/utils/types";

const isIntegrationTest = process.env.INTEGRATION_TEST === "true";

const isJiraAvailable = async (): Promise<boolean> => {
  try {
    const result = await executeJiraCommand(["version"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
};

const shouldRunIntegrationTests =
  isIntegrationTest && (await isJiraAvailable());

describe.skipIf(!shouldRunIntegrationTests)(
  "moveTicket integration tests",
  () => {
    test.skipIf(!process.env.JIRA_CLI_MCP_TEST_TICKET)(
      "should move ticket status with real jira-cli",
      async () => {
        // Use the ticket from environment variable
        const ticketKey = process.env.JIRA_CLI_MCP_TEST_TICKET as string;

        // Get current status
        const initialTicket = await getTicket({ ticketKey, comments: 0 });
        const initialStatus = initialTicket.status;

        // Try to move to a different status
        // Note: This test might fail if the workflow doesn't allow certain transitions
        let targetStatus: "in progress" | "open" | "todo";
        if (initialStatus.toLowerCase() === "open") {
          targetStatus = "in progress";
        } else if (initialStatus.toLowerCase() === "in progress") {
          targetStatus = "open";
        } else {
          targetStatus = "todo";
        }

        try {
          const result = await moveTicket({
            ticketKey,
            status: targetStatus,
          });

          expect(result.success).toBe(true);
          expect(result.ticketKey).toBe(ticketKey);
          expect(result.previousStatus).toBe(initialStatus);

          // Verify the status was actually changed
          const updatedTicket = await getTicket({ ticketKey, comments: 0 });
          const expectedStatus =
            targetStatus === "todo" ? "to do" : targetStatus;
          expect(updatedTicket.status.toLowerCase()).toBe(expectedStatus);

          // Move back to original status to clean up
          await moveTicket({
            ticketKey,
            status: initialStatus.toLowerCase() as JiraStatusValue,
          });
        } catch (error) {
          // If the transition is not allowed, that's okay for this test
          if (
            error instanceof Error &&
            error.message.includes("Invalid transition")
          ) {
            console.log(`Skipping test: ${error.message}`);
            return;
          }
          throw error;
        }
      },
    );

    test("should handle invalid ticket with real jira-cli", async () => {
      await expect(
        moveTicket({
          ticketKey: "NONEXISTENT-999999",
          status: "done",
        }),
      ).rejects.toThrow();
    });
  },
);
