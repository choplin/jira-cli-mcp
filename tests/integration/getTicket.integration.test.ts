import { describe, expect, test } from "bun:test";
import { getTicket } from "../../src/tools/getTicket";
import { listTickets } from "../../src/tools/listTickets";

const isIntegrationTest = process.env.INTEGRATION_TEST === "true";

const isJiraAvailable = async (): Promise<boolean> => {
  try {
    const { executeJiraCommand } = await import("../../src/utils/jiraExecutor");
    const result = await executeJiraCommand(["version"]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
};

const shouldRunIntegrationTests = isIntegrationTest && await isJiraAvailable();

describe.skipIf(!shouldRunIntegrationTests)("getTicket integration tests", () => {
  test("should work with real jira-cli", async () => {
    // First, get a valid ticket from list to use for testing
    const ticketList = await listTickets({ limit: 1 });
    
    if (ticketList.tickets.length === 0) {
      console.log("Skipping test: no tickets available");
      return;
    }

    const firstTicketKey = ticketList.tickets[0]!.key;
    const result = await getTicket({
      ticketKey: firstTicketKey,
      comments: 2,
    });

    expect(result).toHaveProperty("key");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("priority");
    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("comments");
    
    expect(typeof result.key).toBe("string");
    expect(typeof result.summary).toBe("string");
    expect(typeof result.status).toBe("string");
    expect(Array.isArray(result.comments)).toBe(true);
    expect(result.key).toBe(firstTicketKey);
  });

  test("should handle invalid ticket key with real jira-cli", async () => {
    await expect(getTicket({
      ticketKey: "INVALID-999999",
      comments: 1,
    })).rejects.toThrow("Failed to get ticket INVALID-999999");
  });
});