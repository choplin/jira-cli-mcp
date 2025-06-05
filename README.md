# Jira CLI MCP Server

[![CI](https://github.com/choplin/jira-cli-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/choplin/jira-cli-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-1.0-green.svg)](https://modelcontextprotocol.io)

MCP (Model Context Protocol) server that wraps the `jira-cli` command-line tool to enable AI assistants to interact
with Jira.

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

2. Install jira-cli-mcp:

   ```bash
   brew tap choplin/jira-cli-mcp
   brew install jira-cli-mcp
   ```

3. Add to Claude Desktop config (see [Setup](#setup-for-claude-desktop) below)

## Prerequisites

- [jira-cli](https://github.com/ankitpokhrel/jira-cli) installed and authenticated
- [Bun](https://bun.sh) runtime (only needed for development or if installing from source)

## Installation

### Option 1: Install via Homebrew (macOS/Linux)

```bash
brew tap choplin/jira-cli-mcp
brew install jira-cli-mcp
```

### Option 2: Install via npm

```bash
# Install globally with npm
npm install -g @choplin/jira-cli-mcp

# Or with Bun
bun install -g @choplin/jira-cli-mcp
```

### Option 3: Download Binary

Download the pre-compiled binary for your platform from the [releases page](https://github.com/choplin/jira-cli-mcp/releases):

- macOS (Apple Silicon): `jira-cli-mcp-darwin-arm64.tar.gz`
- macOS (Intel): `jira-cli-mcp-darwin-x64.tar.gz`
- Linux (x64): `jira-cli-mcp-linux-x64.tar.gz`
- Linux (ARM64): `jira-cli-mcp-linux-arm64.tar.gz`

```bash
# Example for macOS (Apple Silicon)
tar -xzf jira-cli-mcp-darwin-arm64.tar.gz
chmod +x jira-cli-mcp-darwin-arm64
sudo mv jira-cli-mcp-darwin-arm64 /usr/local/bin/jira-cli-mcp
```

### Option 4: Build from Source

```bash
git clone https://github.com/choplin/jira-cli-mcp.git
cd jira-cli-mcp
bun install
bun run build:prod
```

## Setup for Claude Desktop

### Option 1: Using Homebrew Installation (Recommended)

If you installed via Homebrew (as shown in Quick Start), add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "jira-cli": {
      "command": "jira-cli-mcp"
    }
  }
}
```

### Option 2: Using npm Package

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "jira-cli": {
      "command": "npx",
      "args": ["@choplin/jira-cli-mcp"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "jira-cli": {
      "command": "jira-cli-mcp"
    }
  }
}
```

### Option 3: Using Pre-compiled Binary (No Dependencies)

1. Download the binary for your platform from [releases](https://github.com/choplin/jira-cli-mcp/releases)
2. Extract and move to your PATH:

```bash
tar -xzf jira-cli-mcp-darwin-arm64.tar.gz
sudo mv jira-cli-mcp-darwin-arm64 /usr/local/bin/jira-cli-mcp
```

1. Add to config:

```json
{
  "mcpServers": {
    "jira-cli": {
      "command": "jira-cli-mcp"
    }
  }
}
```

### Option 4: Build from Source

1. Clone and run directly:

```bash
git clone https://github.com/choplin/jira-cli-mcp.git
cd jira-cli-mcp
bun install
```

1. Add to config:

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

### Configuration Location

The config file is typically located at:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Verification

After setup, restart Claude Desktop and check if the MCP server is loaded by asking Claude about available Jira tools.

## Setup for Other AI Assistants

### Claude Code

Claude Code has built-in support for MCP servers. To use jira-cli-mcp in your project:

1. First install jira-cli-mcp using one of the methods in the [Installation](#installation) section

2. Create a `.claude/mcp.json` file in your project root:

```json
{
  "servers": {
    "jira-cli": {
      "command": "jira-cli-mcp"
    }
  }
}
```

1. Restart Claude Code and the MCP server will be automatically loaded

You can then use Jira commands directly in your conversation, such as:

- "List my open Jira tickets"
- "Show me details for PROJ-123"
- "Add a comment to PROJ-456"

### GitHub Copilot (VS Code)

GitHub Copilot supports MCP servers in Visual Studio Code (version 1.99+):

1. First install jira-cli-mcp using one of the methods in the [Installation](#installation) section

2. Create `.vscode/mcp.json` in your repository:

```json
{
  "servers": {
    "jira-cli": {
      "command": "jira-cli-mcp"
    }
  }
}
```

1. Open the `.vscode/mcp.json` file in VS Code and click the **[Start]** button to activate the server

2. In Copilot Chat:
   - Open Copilot Chat panel
   - Select "Agent" from the popup menu
   - Click the tools icon to see available MCP servers

**Note**: MCP support in GitHub Copilot is currently in public preview.

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
