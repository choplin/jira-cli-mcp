import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";

export const assignToMeSchema = z.object({
  ticketKey: z.string().describe("Jira ticket key (e.g., PROJ-123)"),
});

export type AssignToMeParams = z.infer<typeof assignToMeSchema>;

export interface AssignToMeResult {
  success: boolean;
  ticketKey: string;
  assignee: string;
  message: string;
}

export async function assignToMe(
  params: AssignToMeParams,
): Promise<AssignToMeResult> {
  const { ticketKey } = params;
  const meResult = await executeJiraCommand(["me"]);
  if (meResult.exitCode !== 0) {
    throw new Error(`Failed to get current user: ${meResult.stderr}`);
  }

  const currentUser = meResult.stdout.trim();
  if (!currentUser) {
    throw new Error("Unable to determine current user");
  }

  // Assign the ticket to current user
  const assignResult = await executeJiraCommand([
    "issue",
    "assign",
    ticketKey,
    currentUser,
  ]);

  if (assignResult.exitCode !== 0) {
    throw new Error(
      `Failed to assign ticket ${ticketKey}: ${assignResult.stderr}`,
    );
  }

  return {
    success: true,
    ticketKey,
    assignee: currentUser,
    message: `Successfully assigned ${ticketKey} to ${currentUser}`,
  };
}
