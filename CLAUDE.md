# Jira CLI MCP Server Project Memory

## Project Overview

MCP (Model Context Protocol) server that wraps the `jira-cli` command-line tool to enable AI assistants to interact
with Jira.

## Key Features

1. **list_tickets** - Search and list Jira tickets with semantic filters

   - Supports JQL queries and semantic parameters (assignedToMe, status, project, etc.)
   - Status enum includes: "open", "in progress", "in review", "done", "closed", "todo", "to do"

2. **get_ticket** - Get detailed ticket information

   - Parses ADF (Atlassian Document Format) to Markdown
   - Includes comments with pagination support

3. **update_ticket_description** - Update ticket descriptions

   - Accepts Markdown input (converted to ADF by jira-cli)

4. **add_comment** - Add comments to tickets

   - Supports rich text formatting via Markdown

5. **assign_to_me** - Assign tickets to current user

   - Uses `jira me` command to get current user

6. **move_ticket** - Move tickets between statuses
   - Maps lowercase status names to Jira status names

7. **open_ticket_in_browser** - Open tickets in default web browser
   - Uses `jira open` command to launch browser

## Technical Details

- **Runtime**: Bun
- **Language**: TypeScript (strict mode, no `any` types)
- **Testing**: Separated unit tests (mocked) and integration tests
- **Code Quality**: Biome for linting/formatting, lefthook for git hooks
- **Type Safety**: Centralized status definitions in `src/utils/types.ts`

## Project Structure

```text
src/
├── index.ts          # MCP server entry point
├── config.ts         # Configuration management
├── tools/           # MCP tool implementations
└── utils/           # Shared utilities
    ├── types.ts     # Common types and status definitions
    ├── jiraExecutor.ts  # jira-cli command wrapper
    └── adf-types.ts # Atlassian Document Format types

tests/
├── *.test.ts        # Unit tests with mocks
└── integration/     # Integration tests with real jira-cli
```

## Environment Variables

- `JIRA_CLI_PATH` - Custom path to jira-cli executable (default: "jira")
- `JIRA_CLI_MCP_TEST_TICKET` - Test ticket for integration tests (development only)

## Key Design Decisions

1. **Test Isolation**: Separated unit and integration tests due to Bun's mock.restore() limitations
2. **Type Safety**: No `any` types, comprehensive ADF type definitions
3. **Status Handling**: Centralized status mapping to handle variations
4. **Error Handling**: Custom JiraCliError class for better error messages
5. **Node.js Imports**: Use `node:` prefix for Node.js modules (Bun convention)

## Development Workflow

1. Unit tests run by default: `bun test`
2. Integration tests require: `INTEGRATION_TEST=true bun test:integration`
3. Lefthook runs on commit: biome check, typecheck, commitlint
4. Lefthook runs on push: tests and build

## Setup for Claude Desktop

Add to `claude_desktop_config.json`:

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

## Recent Changes

### v0.2.1 (Current)

- Fixed JQL ORDER BY error by implementing workaround for jira-cli bug (#11)
  - Removed ORDER BY clause from JQL generation
  - Added ordering via `--order-by` and `--reverse` flags instead
  - Added comprehensive tests for ordering behavior

### v0.2.0

- Added `open_ticket_in_browser` tool - Opens Jira tickets in the default web browser
- Added Homebrew distribution support with automatic tap updates
- Fixed `add_comment` and `update_ticket_description` to use stdin for long content
- Added dual distribution via npm and pre-compiled binaries
- Added setup instructions for Claude Code and GitHub Copilot
- Added markdownlint for consistent markdown formatting
- Improved documentation with package manager distribution plans

### v0.1.0

- Initial public release with core MCP tools
- Added Apache License 2.0
- Added GitHub Actions CI workflow
- Fixed unit tests to pass without jira-cli installed
- Added CI status badge to README
