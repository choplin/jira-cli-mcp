# Homebrew Tap Setup for jira-cli-mcp

This document explains the Homebrew distribution setup using a separate tap repository.

## Architecture

We use two repositories:
1. **Main repository** (`jira-cli-mcp`) - Contains source code and release automation
2. **Tap repository** (`homebrew-jira-cli-mcp`) - Contains only the Homebrew formula

## How It Works

1. When a new release is tagged in the main repository:
   - GitHub Actions builds binaries for all platforms
   - Calculates SHA256 checksums
   - Sends a `repository_dispatch` event to the tap repository

2. The tap repository receives the event and:
   - Updates the formula with new version and checksums
   - Creates a pull request for review
   - Once merged, users can install the new version

## Setting Up the Tap Repository

1. Create a new repository named `homebrew-jira-cli-mcp` on GitHub

2. Copy the contents of `homebrew-jira-cli-mcp/` directory:
   ```bash
   cp -r homebrew-jira-cli-mcp/* /path/to/new/repo/
   cd /path/to/new/repo
   git add .
   git commit -m "Initial tap setup"
   git push origin main
   ```

3. Create a Personal Access Token:
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Create a token with `repo` scope
   - Add it as `TAP_GITHUB_TOKEN` secret in the main repository

## Manual Updates

If automatic updates fail, use the manual script:
```bash
./scripts/update-homebrew-formula.sh 0.1.0
# Then manually copy the updated formula to the tap repository
```

## Automation

The GitHub Actions workflow in this repository will automatically:

1. Calculate SHA256 checksums for each binary
2. Update the formula with the correct version and checksums
3. Create a PR to update the formula

## Alternative: Homebrew Core

For wider distribution, you can submit the formula to homebrew-core:

1. Fork https://github.com/Homebrew/homebrew-core
2. Add your formula to `Formula/j/jira-cli-mcp.rb`
3. Submit a pull request

Note: Homebrew core has stricter requirements:
- Must have at least 50 GitHub stars
- Must be a stable release (no pre-releases)
- Must pass all Homebrew tests