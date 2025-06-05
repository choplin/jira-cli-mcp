import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";
import type { JiraCliError } from "../utils/jiraExecutor.js";

export const updateTicketDescriptionSchema = z.object({
  ticketKey: z.string().describe("Jira ticket key (e.g., PROJ-123)"),
  description: z.string().describe("New description content for the ticket"),
});

export type UpdateTicketDescriptionParams = z.infer<
  typeof updateTicketDescriptionSchema
>;

export interface UpdateTicketDescriptionResult {
  success: boolean;
  ticketKey: string;
  message: string;
}

export async function updateTicketDescription(
  params: UpdateTicketDescriptionParams,
): Promise<UpdateTicketDescriptionResult> {
  const { ticketKey, description } = params;

  // Use stdin for description to handle multi-line content and special characters
  const args = ["issue", "edit", ticketKey, "--no-input"];
  const result = await executeJiraCommand(args, description);

  if (result.exitCode !== 0) {
    throw new Error(`Failed to update ticket ${ticketKey}: ${result.stderr}`);
  }

  return {
    success: true,
    ticketKey,
    message: `Successfully updated description for ${ticketKey}`,
  };
}
