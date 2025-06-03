import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";
import type { JiraTicket } from "../utils/types.js";

export const listTicketsSchema = z.object({
  jql: z.string().optional(),
  limit: z.number().optional().default(20),
});

export type ListTicketsParams = z.infer<typeof listTicketsSchema>;

export async function listTickets(params: ListTicketsParams): Promise<{
  tickets: JiraTicket[];
}> {
  const { jql, limit } = params;

  // Build command arguments
  const args = [
    "issue",
    "list",
    "--no-headers",
    "--plain",
    "--columns",
    "key,summary,status,priority,type,assignee",
  ];

  // Add JQL only if provided
  if (jql) {
    args.push("--jql", jql);
  }

  if (limit > 0) {
    args.push("--paginate", `0:${limit}`);
  }

  const result = await executeJiraCommand(args);

  if (result.exitCode !== 0) {
    // Check if it's just "No result found" which is not an error
    if (result.stderr.includes("No result found")) {
      return { tickets: [] };
    }
    throw new Error(`Failed to list tickets: ${result.stderr}`);
  }

  // Parse the plain text output
  const lines = result.stdout
    .trim()
    .split("\n")
    .filter((line) => line.length > 0);

  const tickets: JiraTicket[] = lines.map((line) => {
    // jira-cli output is tab-separated in plain mode, but may have multiple tabs
    const columns = line.split("\t").filter(col => col.trim() !== "");

    // Expected columns: key, summary, status, priority, type, assignee
    // But actual output may have empty columns, so we need to be flexible
    return {
      key: columns[0]?.trim() || "",
      summary: columns[1]?.trim() || "",
      status: columns[2]?.trim() || "",
      priority: columns[3]?.trim() || "",
      type: columns[4]?.trim() || "",
      assignee: columns[5]?.trim() || undefined,
    };
  });

  return { tickets };
}