import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";
import { JIRA_STATUS_VALUES, JIRA_STATUS_MAP } from "../utils/types.js";

export const moveTicketSchema = z.object({
  ticketKey: z.string().describe("Jira ticket key (e.g., PROJ-123)"),
  status: z.enum(JIRA_STATUS_VALUES).describe("Target status to move the ticket to"),
});

export type MoveTicketParams = z.infer<typeof moveTicketSchema>;

export interface MoveTicketResult {
  success: boolean;
  ticketKey: string;
  previousStatus: string;
  newStatus: string;
  message: string;
}

export async function moveTicket(
  params: MoveTicketParams,
): Promise<MoveTicketResult> {
  const { ticketKey, status } = params;

  // Map lowercase enum values to Jira status names
  const targetStatus = JIRA_STATUS_MAP[status];

  // First, get current status using list command with specific JQL
  const viewResult = await executeJiraCommand([
    "issue",
    "list",
    "--jql",
    `key = ${ticketKey}`,
    "--plain",
    "--no-headers",
    "--columns",
    "status",
  ]);

  if (viewResult.exitCode !== 0) {
    throw new Error(`Failed to get current status for ${ticketKey}: ${viewResult.stderr}`);
  }

  // Parse the output - format is "KEY\tStatus"
  const outputParts = viewResult.stdout.trim().split("\t");
  const currentStatus = outputParts[1] || outputParts[0] || "Unknown"; // Handle both "Status" and "KEY\tStatus" formats

  // Move the ticket to the new status
  try {
    const moveResult = await executeJiraCommand([
      "issue",
      "move",
      ticketKey,
      targetStatus,
    ]);

    if (moveResult.exitCode !== 0) {
      throw new Error(`Failed to move ticket ${ticketKey}: ${moveResult.stderr}`);
    }

    return {
      success: true,
      ticketKey,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      message: `Successfully moved ${ticketKey} from ${currentStatus} to ${targetStatus}`,
    };
  } catch (error) {
    // Re-throw the error as is
    throw error;
  }
}