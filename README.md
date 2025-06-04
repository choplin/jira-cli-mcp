# Jira CLI MCP Server

MCP (Model Context Protocol) server that wraps the `jira-cli` command-line tool to enable AI assistants to interact with Jira.

## Features

- **list_tickets** - Search and list Jira tickets using JQL queries
- **get_ticket** - Get detailed ticket information including comments
- **update_ticket_description** - Update ticket descriptions with rich text formatting
- **add_comment** - Add comments to tickets with Markdown support
- **assign_to_me** - Assign tickets to the current user
- **move_ticket** - Move tickets between different statuses

## Prerequisites

- [jira-cli](https://github.com/ankitpokhrel/jira-cli) installed and authenticated
- Bun runtime

## Installation

```bash
bun install
```

## Usage

The MCP server runs on stdio and can be integrated with AI assistants that support the Model Context Protocol.

```bash
bun run src/index.ts
```

## Development

### Running Tests

```bash
# Run unit tests only
bun test

# Run all tests including integration tests
bun run test:integration

# Run integration tests with a specific test ticket
JIRA_CLI_MCP_TEST_TICKET=PROJ-123 bun run test:integration
```

### Environment Variables

- `JIRA_CLI_PATH` - Custom path to jira-cli executable (default: "jira")
- `JIRA_CLI_MCP_TEST_TICKET` - Ticket key for integration tests (required for non-listing integration tests)
- `INTEGRATION_TEST=true` - Enable integration tests

### Type Checking

```bash
bun run typecheck
```

### Linting and Formatting

```bash
bun run lint
bun run format
```

## Architecture

- `src/tools/` - MCP tool implementations
- `src/utils/` - Shared utilities and types
- `tests/` - Unit tests with mocked jira-cli
- `tests/integration/` - Integration tests with real jira-cli

## Notes

- The server uses Atlassian Document Format (ADF) for rich text handling
- Markdown input is automatically converted to ADF by jira-cli
- All integration tests require proper jira-cli authentication
