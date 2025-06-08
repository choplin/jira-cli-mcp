import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";
import type { CreateTicketParams, CreateTicketResult } from "../utils/types.js";

export const createTicketSchema = z.object({
  project: z.string().describe("Jira project key (e.g., PROJ)"),
  type: z.string().describe("Issue type (e.g., Bug, Story, Task)"),
  summary: z.string().describe("Issue summary/title"),
  description: z
    .string()
    .optional()
    .describe("Issue description (markdown supported)"),
  priority: z
    .string()
    .optional()
    .describe("Priority level (e.g., High, Medium, Low)"),
  assignee: z.string().optional().describe("Assignee username or email"),
  labels: z.array(z.string()).optional().describe("List of labels to add"),
  components: z
    .array(z.string())
    .optional()
    .describe("List of components to add"),
});

export async function createTicket(
  params: CreateTicketParams,
): Promise<CreateTicketResult> {
  const args = [
    "issue",
    "create",
    "--project",
    params.project,
    "--type",
    params.type,
    "--summary",
    params.summary,
    "--no-input",
    "--raw",
  ];

  if (params.priority) {
    args.push("--priority", params.priority);
  }

  if (params.assignee) {
    args.push("--assignee", params.assignee);
  }

  if (params.labels && params.labels.length > 0) {
    for (const label of params.labels) {
      args.push("--label", label);
    }
  }

  if (params.components && params.components.length > 0) {
    for (const component of params.components) {
      args.push("--component", component);
    }
  }

  // If description is provided, use stdin with template flag to handle multi-line content
  const stdin = params.description ? params.description : undefined;
  if (stdin) {
    args.push("--template", "-");
  }

  try {
    const result = await executeJiraCommand(args, stdin);

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr || "Failed to create ticket",
      };
    }

    // Parse the JSON output from --raw flag
    const output = JSON.parse(result.stdout);
    const ticketKey = output.key;
    const ticketUrl =
      output.self ||
      `${output.fields?.project?.self?.split("/rest/")[0]}/browse/${ticketKey}`;

    return {
      success: true,
      ticketKey,
      ticketUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to create ticket: ${errorMessage}`,
    };
  }
}
