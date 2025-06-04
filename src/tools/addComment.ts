import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";

export const addCommentSchema = z.object({
  ticketKey: z.string().describe("Jira ticket key (e.g., PROJ-123)"),
  comment: z.string().describe("Comment text to add to the ticket"),
});

export type AddCommentParams = z.infer<typeof addCommentSchema>;

export interface AddCommentResult {
  success: boolean;
  ticketKey: string;
  message: string;
}

export async function addComment(
  params: AddCommentParams,
): Promise<AddCommentResult> {
  const { ticketKey, comment } = params;

  // Build command arguments
  const args = ["issue", "comment", "add", ticketKey, comment, "--no-input"];
  const result = await executeJiraCommand(args);

  if (result.exitCode !== 0) {
    throw new Error(`Failed to add comment to ${ticketKey}: ${result.stderr}`);
  }

  return {
    success: true,
    ticketKey,
    message: `Successfully added comment to ${ticketKey}`,
  };
}
