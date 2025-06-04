import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";
import type { JiraTicketDetail, JiraComment } from "../utils/types.js";

export const getTicketSchema = z.object({
  ticketKey: z.string().describe("Jira ticket key (e.g., PROJ-123)"),
  comments: z.number().optional().default(5).describe("Number of comments to include"),
});

export type GetTicketParams = z.infer<typeof getTicketSchema>;

interface JiraRawResponse {
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    priority: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    reporter?: {
      displayName: string;
    };
    created: string;
    updated: string;
    comment: {
      comments: Array<{
        author: {
          displayName: string;
        };
        created: string;
        body: string;
      }>;
    };
  };
}

export async function getTicket(params: GetTicketParams): Promise<JiraTicketDetail> {
  const { ticketKey, comments } = params;

  // Build command arguments
  const args = ["issue", "view", ticketKey, "--raw"];

  if (comments > 0) {
    args.push("--comments", comments.toString());
  }

  const result = await executeJiraCommand(args);

  if (result.exitCode !== 0) {
    throw new Error(`Failed to get ticket ${ticketKey}: ${result.stderr}`);
  }

  // Parse JSON response
  let rawData: JiraRawResponse;
  try {
    rawData = JSON.parse(result.stdout) as JiraRawResponse;
  } catch (error) {
    throw new Error(`Failed to parse jira response: ${result.stdout}`);
  }

  // Extract ticket details
  const ticket: JiraTicketDetail = {
    key: rawData.key,
    summary: rawData.fields.summary,
    status: rawData.fields.status.name,
    priority: rawData.fields.priority.name,
    type: rawData.fields.issuetype.name,
    assignee: rawData.fields.assignee?.displayName,
    reporter: rawData.fields.reporter?.displayName,
    created: rawData.fields.created,
    updated: rawData.fields.updated,
    description: rawData.fields.description || "",
    comments: rawData.fields.comment.comments.map((comment): JiraComment => ({
      author: comment.author.displayName,
      created: comment.created,
      body: comment.body,
    })),
  };

  return ticket;
}