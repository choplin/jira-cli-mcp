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