import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";
import type { JiraTicket } from "../utils/types.js";
import { JIRA_STATUS_MAP, JIRA_STATUS_VALUES } from "../utils/types.js";

export const listTicketsSchema = z.object({
  jql: z.string().optional().describe("Raw JQL query (advanced users only)"),
  limit: z.number().default(20).describe("Maximum number of tickets to return"),
  // Semantic filters
  assignedToMe: z
    .boolean()
    .optional()
    .describe("Show only tickets assigned to me"),
  unassigned: z.boolean().optional().describe("Show only unassigned tickets"),
  status: z.enum(JIRA_STATUS_VALUES).optional().describe("Filter by status"),
  project: z
    .string()
    .optional()
    .describe("Filter by project key (e.g., 'PROJ')"),
  createdRecently: z
    .boolean()
    .optional()
    .describe("Show tickets created in the last 7 days"),
  updatedRecently: z
    .boolean()
    .optional()
    .describe("Show tickets updated in the last 7 days"),
  orderBy: z
    .enum(["created", "updated", "priority"])
    .optional()
    .describe("Sort tickets by field"),
  orderDirection: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
});

export type ListTicketsParams = z.infer<typeof listTicketsSchema>;

// Build JQL from semantic parameters
function buildJQLFromParams(params: ListTicketsParams): string | undefined {
  // If raw JQL is provided, use it directly
  if (params.jql) {
    return params.jql;
  }

  const conditions: string[] = [];

  // Assignee filters
  if (params.assignedToMe) {
    conditions.push("assignee = currentUser()");
  } else if (params.unassigned) {
    conditions.push("assignee is EMPTY");
  }

  // Status filter
  if (params.status) {
    const jiraStatus = JIRA_STATUS_MAP[params.status];
    conditions.push(`status = "${jiraStatus}"`);
  }

  // Project filter
  if (params.project) {
    conditions.push(`project = ${params.project}`);
  }

  // Date filters
  if (params.createdRecently) {
    conditions.push("created >= -7d");
  }
  if (params.updatedRecently) {
    conditions.push("updated >= -7d");
  }

  // Build the JQL query
  const jql = conditions.length > 0 ? conditions.join(" AND ") : undefined;

  // Note: jira-cli has a bug with ORDER BY in JQL queries
  // We handle ordering via --order-by flag instead
  // See: https://github.com/choplin/jira-cli-mcp/issues/11

  return jql;
}

export async function listTickets(
  params: Partial<ListTicketsParams> = {},
): Promise<{
  tickets: JiraTicket[];
}> {
  // Parse params with schema to apply defaults
  const parsedParams = listTicketsSchema.parse(params);
  const { limit } = parsedParams;
  const jql = buildJQLFromParams(parsedParams);

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

  // Add ordering using jira-cli flags (workaround for ORDER BY bug in jira-cli)
  // See: https://github.com/choplin/jira-cli-mcp/issues/11
  if (parsedParams.orderBy) {
    args.push("--order-by", parsedParams.orderBy);
    if (parsedParams.orderDirection === "asc") {
      // jira-cli uses --reverse flag, which defaults to DESC
      // So we only add --reverse for ASC (to reverse the default DESC)
      args.push("--reverse");
    }
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
    const columns = line.split("\t").filter((col) => col.trim() !== "");

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
