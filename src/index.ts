#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listTickets, listTicketsSchema } from "./tools/listTickets.js";
import { JiraCliError } from "./utils/jiraExecutor.js";

const server = new McpServer({
  name: "jira-cli-mcp",
  version: "1.0.0",
});

// List tickets tool
server.tool(
  "list_tickets",
  {
    jql: listTicketsSchema.shape.jql,
    limit: listTicketsSchema.shape.limit,
  },
  async (params) => {
    try {
      const result = await listTickets(params);
      const ticketList = result.tickets
        .map(
          (t) =>
            `${t.key}: ${t.summary}\n  Status: ${t.status} | Priority: ${t.priority} | Type: ${t.type}${
              t.assignee ? ` | Assignee: ${t.assignee}` : ""
            }`,
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: ticketList || "No tickets found.",
          },
        ],
      };
    } catch (error) {
      if (error instanceof JiraCliError) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}\n\nMake sure jira-cli is installed and authenticated.`,
            },
          ],
        };
      }
      throw error;
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
