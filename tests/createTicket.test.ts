import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createTicket } from "../src/tools/createTicket.js";
import * as jiraExecutor from "../src/utils/jiraExecutor.js";

describe("createTicket", () => {
  beforeEach(() => {
    mock.restore();
  });

  test("creates a ticket successfully with minimal params", async () => {
    const mockResult = {
      key: "PROJ-123",
      self: "https://example.atlassian.net/rest/api/2/issue/12345",
      fields: {
        project: {
          self: "https://example.atlassian.net/rest/api/2/project/10000",
        },
      },
    };

    mock.module("../src/utils/jiraExecutor.js", () => ({
      executeJiraCommand: mock(async () => ({
        stdout: JSON.stringify(mockResult),
        stderr: "",
        exitCode: 0,
      })),
    }));

    const result = await createTicket({
      project: "PROJ",
      type: "Task",
      summary: "Test ticket",
    });

    expect(result).toEqual({
      success: true,
      ticketKey: "PROJ-123",
      ticketUrl: "https://example.atlassian.net/rest/api/2/issue/12345",
    });

    expect(jiraExecutor.executeJiraCommand).toHaveBeenCalledWith(
      [
        "issue",
        "create",
        "--project",
        "PROJ",
        "--type",
        "Task",
        "--summary",
        "Test ticket",
        "--no-input",
        "--raw",
      ],
      undefined,
    );
  });

  test("creates a ticket with all parameters", async () => {
    const mockResult = {
      key: "PROJ-124",
      self: "https://example.atlassian.net/rest/api/2/issue/12346",
    };

    mock.module("../src/utils/jiraExecutor.js", () => ({
      executeJiraCommand: mock(async () => ({
        stdout: JSON.stringify(mockResult),
        stderr: "",
        exitCode: 0,
      })),
    }));

    const result = await createTicket({
      project: "PROJ",
      type: "Bug",
      summary: "Bug report",
      description: "This is a detailed description\nwith multiple lines",
      priority: "High",
      assignee: "john.doe",
      labels: ["bug", "urgent"],
      components: ["backend", "api"],
    });

    expect(result).toEqual({
      success: true,
      ticketKey: "PROJ-124",
      ticketUrl: "https://example.atlassian.net/rest/api/2/issue/12346",
    });

    expect(jiraExecutor.executeJiraCommand).toHaveBeenCalledWith(
      [
        "issue",
        "create",
        "--project",
        "PROJ",
        "--type",
        "Bug",
        "--summary",
        "Bug report",
        "--no-input",
        "--raw",
        "--priority",
        "High",
        "--assignee",
        "john.doe",
        "--label",
        "bug",
        "--label",
        "urgent",
        "--component",
        "backend",
        "--component",
        "api",
        "--template",
        "-",
      ],
      "This is a detailed description\nwith multiple lines",
    );
  });

  test("handles creation failure", async () => {
    mock.module("../src/utils/jiraExecutor.js", () => ({
      executeJiraCommand: mock(async () => ({
        stdout: "",
        stderr: "Error: Project not found",
        exitCode: 1,
      })),
    }));

    const result = await createTicket({
      project: "INVALID",
      type: "Task",
      summary: "Test ticket",
    });

    expect(result).toEqual({
      success: false,
      error: "Error: Project not found",
    });
  });

  test("handles JSON parsing error", async () => {
    mock.module("../src/utils/jiraExecutor.js", () => ({
      executeJiraCommand: mock(async () => ({
        stdout: "Invalid JSON",
        stderr: "",
        exitCode: 0,
      })),
    }));

    const result = await createTicket({
      project: "PROJ",
      type: "Task",
      summary: "Test ticket",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to create ticket:");
  });

  test("constructs URL from project self link when ticket self is missing", async () => {
    const mockResult = {
      key: "PROJ-125",
      fields: {
        project: {
          self: "https://example.atlassian.net/rest/api/2/project/10000",
        },
      },
    };

    mock.module("../src/utils/jiraExecutor.js", () => ({
      executeJiraCommand: mock(async () => ({
        stdout: JSON.stringify(mockResult),
        stderr: "",
        exitCode: 0,
      })),
    }));

    const result = await createTicket({
      project: "PROJ",
      type: "Task",
      summary: "Test ticket",
    });

    expect(result).toEqual({
      success: true,
      ticketKey: "PROJ-125",
      ticketUrl: "https://example.atlassian.net/browse/PROJ-125",
    });
  });
});
