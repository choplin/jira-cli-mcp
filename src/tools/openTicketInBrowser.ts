import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";

export const openTicketInBrowserSchema = z.object({
  ticketKey: z.string().describe("Jira ticket key (e.g., PROJ-123)"),
});

export type OpenTicketInBrowserParams = z.infer<
  typeof openTicketInBrowserSchema
>;

export async function openTicketInBrowser(
  params: OpenTicketInBrowserParams,
): Promise<{ message: string }> {
  const { ticketKey } = params;

  // Build command arguments
  const args = ["open", ticketKey];

  const result = await executeJiraCommand(args);

  if (result.exitCode !== 0) {
    throw new Error(
      `Failed to open ticket ${ticketKey} in browser: ${result.stderr}`,
    );
  }

  return {
    message: `Successfully opened ticket ${ticketKey} in browser`,
  };
}
