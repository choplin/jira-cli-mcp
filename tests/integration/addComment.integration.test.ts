import { describe, expect, test } from "bun:test";
import { addComment } from "../../src/tools/addComment";
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
  "addComment integration tests",
  () => {
    test.skipIf(!process.env.JIRA_CLI_MCP_TEST_TICKET)(
      "should add comment with real jira-cli",
      async () => {
        // Use the ticket from environment variable
        const ticketKey = process.env.JIRA_CLI_MCP_TEST_TICKET as string;

        // Add a test comment with timestamp
        const testComment = `Test comment from MCP integration test at ${new Date().toISOString()}

This comment was added by the jira-cli MCP server integration test suite.`;

        const result = await addComment({
          ticketKey,
          comment: testComment,
        });

        expect(result.success).toBe(true);
        expect(result.ticketKey).toBe(ticketKey);

        // Verify the comment was added by fetching the ticket
        const ticket = await getTicket({ ticketKey, comments: 10 });
        const lastComment = ticket.comments[ticket.comments.length - 1];

        // The comment should be recent (within last minute)
        if (lastComment) {
          const commentDate = new Date(lastComment.created);
          const now = new Date();
          const diffMinutes =
            (now.getTime() - commentDate.getTime()) / (1000 * 60);
          expect(diffMinutes).toBeLessThan(1);
        }
      },
    );

    test.skipIf(!process.env.JIRA_CLI_MCP_TEST_TICKET)(
      "should handle rich text formatting in comments",
      async () => {
        const ticketKey = process.env.JIRA_CLI_MCP_TEST_TICKET as string;

        const richComment = `## Integration Test Comment

This comment tests **rich text** formatting:

- Bullet point 1
- Bullet point 2

\`\`\`javascript
// Code block test
const result = await addComment({
  ticketKey: "TEST-123",
  comment: "Hello!"
});
\`\`\`

> This is a blockquote

---

*Italics* and ~~strikethrough~~ text.`;

        const result = await addComment({
          ticketKey,
          comment: richComment,
        });

        expect(result.success).toBe(true);
      },
    );

    test.skip("should handle permission errors with real jira-cli", async () => {
      // This test is skipped because jira-cli behavior with non-existent tickets
      // varies based on configuration and can timeout instead of returning an error
      // Try to add comment to a non-existent ticket
      await expect(
        addComment({
          ticketKey: "NONEXISTENT-999999",
          comment: "This should fail",
        }),
      ).rejects.toThrow();
    });
  },
);
