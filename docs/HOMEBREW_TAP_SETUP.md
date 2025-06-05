# Setting up Homebrew Tap for jira-cli-mcp

This guide explains how to set up a Homebrew tap for distributing jira-cli-mcp.

## Prerequisites

- A GitHub account
- A macOS machine for testing

## Steps

### 1. Create a new repository for your tap

Create a new repository named `homebrew-jira-cli-mcp` on GitHub. Homebrew taps must follow the naming convention `homebrew-*`.

### 2. Add the formula

Copy the `homebrew/jira-cli-mcp.rb` file from this repository to your tap repository.

### 3. Test the formula locally

```bash
# Clone your tap
git clone https://github.com/choplin/homebrew-jira-cli-mcp.git
cd homebrew-jira-cli-mcp

# Test the formula
brew install --build-from-source ./jira-cli-mcp.rb
```

### 4. Publish your tap

Push the formula to your GitHub repository:

```bash
git add jira-cli-mcp.rb
git commit -m "Add jira-cli-mcp formula"
git push origin main
```

### 5. Users can now install via Homebrew

```bash
# Add your tap
brew tap choplin/jira-cli-mcp

# Install the formula
brew install jira-cli-mcp
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