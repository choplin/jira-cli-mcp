# Jira CLI MCP Server

[![CI](https://github.com/choplin/jira-cli-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/choplin/jira-cli-mcp/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![MCP](https://img.shields.io/badge/MCP-1.0-green.svg)](https://modelcontextprotocol.io)

MCP (Model Context Protocol) server that wraps the `jira-cli` command-line tool to enable AI assistants to interact with Jira.

## Why jira-cli-mcp?

If you're looking for a Jira MCP server, here's what makes jira-cli-mcp unique:

- **🚀 Leverage Existing Tools** - Works seamlessly with your existing jira-cli setup and authentication
- **🔒 Security-First** - No API tokens in config files; authentication handled by jira-cli  
- **🪶 Lightweight** - Just a Bun process, no Docker or containers required

### When to use mcp-atlassian instead?

Choose [mcp-atlassian](https://github.com/sooperset/mcp-atlassian) if you:
- Need **Confluence** support (we're Jira-only)
- Prefer **Docker** deployment 
- Want a **self-contained** solution without CLI dependencies
- Need **direct API** integration rather than CLI wrapping

## Features

- **list_tickets** - Search and list Jira tickets using JQL queries
- **get_ticket** - Get detailed ticket information including comments
- **update_ticket_description** - Update ticket descriptions with rich text formatting
- **add_comment** - Add comments to tickets with Markdown support
- **assign_to_me** - Assign tickets to the current user
- **move_ticket** - Move tickets between different statuses
- **open_ticket_in_browser** - Open a Jira ticket in the default web browser

## Quick Start

1. Install and configure [jira-cli](https://github.com/ankitpokhrel/jira-cli) ([Installation guide](https://github.com/ankitpokhrel/jira-cli/wiki/Installation)):
   ```bash
   # Install jira-cli (macOS)
   brew install ankitpokhrel/jira-cli/jira-cli
   
   # Configure jira-cli with your Jira instance
   jira init
   ```

2. Install [Bun](https://bun.sh) runtime:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. Clone and install this MCP server:
   ```bash
   git clone https://github.com/choplin/jira-cli-mcp.git
   cd jira-cli-mcp
   bun install
   ```

4. Add to Claude Desktop config (see [Setup](#setup-for-claude-desktop) below)

## Prerequisites

- [jira-cli](https://github.com/ankitpokhrel/jira-cli) installed and authenticated
- [Bun](https://bun.sh) runtime

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

## Troubleshooting

### Common Issues

1. **"jira-cli not found" error**
   - Ensure jira-cli is installed: `which jira`
   - If using a custom path, set `JIRA_CLI_PATH` environment variable

2. **Authentication errors**
   - Run `jira me` to verify authentication
   - Re-authenticate with `jira init` if needed

3. **MCP server not showing in Claude Desktop**
   - Verify the config file path is correct
   - Ensure the path in config uses absolute paths, not relative
   - Restart Claude Desktop after config changes

4. **Permission errors on macOS**
   - Grant terminal/Claude Desktop full disk access in System Preferences
   - Ensure jira-cli has necessary permissions

### Debug Mode

To see detailed logs, you can run the server manually:

```bash
cd /path/to/jira-cli-mcp
bun run src/index.ts
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
