# Jira CLI MCP Server

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![MCP](https://img.shields.io/badge/MCP-1.0-green.svg)](https://modelcontextprotocol.io)

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

## Setup for Claude Desktop

### Option 1: Direct Path (Recommended for Development)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "jira-cli": {
      "command": "bun",
      "args": ["run", "/path/to/jira-cli-mcp/src/index.ts"]
    }
  }
}
```

### Option 2: Built Version (Recommended for Production)

1. Build the project:

```bash
cd /path/to/jira-cli-mcp
bun install
bun run build
```

2. Add to config:

```json
{
  "mcpServers": {
    "jira-cli": {
      "command": "bun",
      "args": ["run", "/path/to/jira-cli-mcp/dist/index.js"]
    }
  }
}
```

### Option 3: Global Binary

1. Create a binary wrapper:

```bash
cd /path/to/jira-cli-mcp
bun build --compile --target=bun-darwin-arm64 --outfile=jira-cli-mcp src/index.ts
sudo mv jira-cli-mcp /usr/local/bin/
```

2. Add to config:

```json
{
  "mcpServers": {
    "jira-cli": {
      "command": "jira-cli-mcp"
    }
  }
}
```

### Configuration Location

The config file is typically located at:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Verification

After setup, restart Claude Desktop and check if the MCP server is loaded by asking Claude about available Jira tools.

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

#### Development Environment Variables

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

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
