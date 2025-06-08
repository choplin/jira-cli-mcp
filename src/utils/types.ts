// Common status values used across the application
export const JIRA_STATUS_VALUES = [
  "open",
  "in progress",
  "in review",
  "done",
  "closed",
  "canceled",
  "todo",
  "to do",
] as const;
export type JiraStatusValue = (typeof JIRA_STATUS_VALUES)[number];

// Map from lowercase enum values to Jira status names
export const JIRA_STATUS_MAP: Record<JiraStatusValue, string> = {
  open: "Open",
  "in progress": "In Progress",
  "in review": "In Review",
  done: "Done",
  closed: "Closed",
  canceled: "Canceled",
  todo: "To Do",
  "to do": "To Do",
};

export interface JiraTicket {
  key: string;
  summary: string;
  status: string;
  priority: string;
  type: string;
  assignee?: string;
  reporter?: string;
  created?: string;
  updated?: string;
  description?: string;
}

export interface JiraComment {
  author: string;
  created: string;
  body: string;
}

export interface JiraTicketDetail extends JiraTicket {
  comments: JiraComment[];
}

export interface Config {
  jiraCliPath: string;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface CreateTicketParams {
  project: string;
  type: string;
  summary: string;
  description?: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  components?: string[];
}

export interface CreateTicketResult {
  success: boolean;
  ticketKey?: string;
  ticketUrl?: string;
  error?: string;
}
