import { z } from "zod";
import { executeJiraCommand } from "../utils/jiraExecutor.js";
import type { JiraTicketDetail, JiraComment } from "../utils/types.js";
import type { 
  AdfDocument, 
  AdfNode, 
  AdfBlockNode,
  AdfParagraph,
  AdfHeading,
  AdfBulletList,
  AdfOrderedList,
  AdfCodeBlock,
  AdfBlockquote,
  AdfText,
  AdfMark
} from "../utils/adf-types.js";

export const getTicketSchema = z.object({
  ticketKey: z.string().describe("Jira ticket key (e.g., PROJ-123)"),
  comments: z.number().optional().default(5).describe("Number of comments to include"),
});

export type GetTicketParams = z.infer<typeof getTicketSchema>;

// Helper function to convert ADF to plain text
function convertAdfToText(adf: AdfDocument): string {
  const parts: string[] = [];
  
  function processInlineContent(nodes: AdfNode[]): string {
    return nodes
      .map((node) => {
        if (node.type === "text") {
          const textNode = node as AdfText;
          let text = textNode.text;
          // Handle marks (bold, italic, code, etc.)
          if (textNode.marks) {
            for (const mark of textNode.marks) {
              switch (mark.type) {
                case "strong":
                  text = `**${text}**`;
                  break;
                case "em":
                  text = `*${text}*`;
                  break;
                case "code":
                  text = `\`${text}\``;
                  break;
                case "strike":
                  text = `~~${text}~~`;
                  break;
              }
            }
          }
          return text;
        } else if (node.type === "hardBreak") {
          return "\n";
        }
        return "";
      })
      .join("");
  }
  
  for (const block of adf.content) {
    switch (block.type) {
      case "paragraph": {
        const para = block as AdfParagraph;
        if (para.content) {
          const text = processInlineContent(para.content);
          if (text) parts.push(text);
        }
        break;
      }
      
      case "heading": {
        const heading = block as AdfHeading;
        if (heading.content) {
          const prefix = "#".repeat(heading.attrs.level);
          const text = processInlineContent(heading.content);
          if (text) parts.push(`${prefix} ${text}`);
        }
        break;
      }
      
      case "bulletList": {
        const list = block as AdfBulletList;
        const listItems = list.content.map((item) => {
          const itemContent = item.content
            .map((p) => {
              if (p.type === "paragraph" && p.content) {
                return processInlineContent(p.content);
              }
              return "";
            })
            .filter(Boolean)
            .join(" ");
          return `- ${itemContent}`;
        });
        if (listItems.length > 0) {
          parts.push(listItems.join("\n"));
        }
        break;
      }
      
      case "orderedList": {
        const list = block as AdfOrderedList;
        const startNum = list.attrs?.start || 1;
        const listItems = list.content.map((item, index) => {
          const itemContent = item.content
            .map((p) => {
              if (p.type === "paragraph" && p.content) {
                return processInlineContent(p.content);
              }
              return "";
            })
            .filter(Boolean)
            .join(" ");
          return `${startNum + index}. ${itemContent}`;
        });
        if (listItems.length > 0) {
          parts.push(listItems.join("\n"));
        }
        break;
      }
      
      case "codeBlock": {
        const codeBlock = block as AdfCodeBlock;
        if (codeBlock.content) {
          const lang = codeBlock.attrs?.language || "";
          const code = codeBlock.content
            .map((textNode) => textNode.text)
            .join("");
          parts.push(`\`\`\`${lang}\n${code}\n\`\`\``);
        }
        break;
      }
      
      case "rule":
        parts.push("---");
        break;
      
      case "blockquote": {
        const quote = block as AdfBlockquote;
        const quotedLines = quote.content
          .map((p) => {
            if (p.type === "paragraph" && p.content) {
              return "> " + processInlineContent(p.content);
            }
            return "";
          })
          .filter(Boolean);
        if (quotedLines.length > 0) {
          parts.push(quotedLines.join("\n"));
        }
        break;
      }
    }
  }
  
  return parts.join("\n\n");
}

interface JiraRawResponse {
  key: string;
  fields: {
    summary: string;
    description?: AdfDocument;  // Jira Cloud API v3 uses ADF format
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

  // Extract description text from ADF format
  let descriptionText = "";
  if (rawData.fields.description) {
    // Convert Atlassian Document Format to plain text
    descriptionText = convertAdfToText(rawData.fields.description);
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
    description: descriptionText,
    comments: rawData.fields.comment.comments.map((comment): JiraComment => ({
      author: comment.author.displayName,
      created: comment.created,
      body: comment.body,
    })),
  };

  return ticket;
}