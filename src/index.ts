import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { addComment, addCommentSchema } from "./tools/addComment.js";
import { assignToMe, assignToMeSchema } from "./tools/assignToMe.js";
import { getTicket, getTicketSchema } from "./tools/getTicket.js";
import { listTickets, listTicketsSchema } from "./tools/listTickets.js";
import { moveTicket, moveTicketSchema } from "./tools/moveTicket.js";
import {
  openTicketInBrowser,
  openTicketInBrowserSchema,
} from "./tools/openTicketInBrowser.js";
import {
  updateTicketDescription,
  updateTicketDescriptionSchema,
} from "./tools/updateTicketDescription.js";
import { JiraCliError } from "./utils/jiraExecutor.js";

const server = new McpServer({
  name: "jira-cli-mcp",
  version: "1.0.0",
});

// List tickets tool
server.tool(
  "list_tickets",
  "Search and list Jira tickets with filters",
  listTicketsSchema.shape,
  {
    title: "List Jira Tickets",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
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

// Get ticket details tool
server.tool(
  "get_ticket",
  "Get detailed information about a specific Jira ticket",
  getTicketSchema.shape,
  {
    title: "Get Jira Ticket Details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const ticket = await getTicket(params);

      const ticketInfo = `**${ticket.key}: ${ticket.summary}**

**Details:**
- Status: ${ticket.status}
- Priority: ${ticket.priority}
- Type: ${ticket.type}
- Assignee: ${ticket.assignee || "Unassigned"}
- Reporter: ${ticket.reporter || "Unknown"}
- Created: ${ticket.created}
- Updated: ${ticket.updated}

**Description:**
${ticket.description || "No description provided"}

**Comments (${ticket.comments.length}):**
${
  ticket.comments.length > 0
    ? ticket.comments
        .map(
          (comment) =>
            `- **${comment.author}** (${comment.created}):\n  ${comment.body}`,
        )
        .join("\n\n")
    : "No comments"
}`;

      return {
        content: [
          {
            type: "text",
            text: ticketInfo,
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

// Update ticket description tool
server.tool(
  "update_ticket_description",
  "Update the description of a Jira ticket",
  updateTicketDescriptionSchema.shape,
  {
    title: "Update Ticket Description",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const result = await updateTicketDescription(params);

      return {
        content: [
          {
            type: "text",
            text: result.message,
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

// Add comment tool
server.tool(
  "add_comment",
  "Add a comment to a Jira ticket",
  addCommentSchema.shape,
  {
    title: "Add Comment to Ticket",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const result = await addComment(params);

      return {
        content: [
          {
            type: "text",
            text: result.message,
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

// Assign to me tool
server.tool(
  "assign_to_me",
  "Assign a Jira ticket to the current user",
  assignToMeSchema.shape,
  {
    title: "Assign Ticket to Me",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const result = await assignToMe(params);

      return {
        content: [
          {
            type: "text",
            text: result.message,
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

// Move ticket tool
server.tool(
  "move_ticket",
  "Move a Jira ticket to a different status",
  moveTicketSchema.shape,
  {
    title: "Move Ticket Status",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const result = await moveTicket(params);

      return {
        content: [
          {
            type: "text",
            text: result.message,
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

// Open ticket in browser tool
server.tool(
  "open_ticket_in_browser",
  "Open a Jira ticket in the default web browser",
  openTicketInBrowserSchema.shape,
  {
    title: "Open Ticket in Browser",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const result = await openTicketInBrowser(params);

      return {
        content: [
          {
            type: "text",
            text: result.message,
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
