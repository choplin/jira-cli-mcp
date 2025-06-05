class JiraCliMcp < Formula
  desc "MCP server that wraps jira-cli for AI assistants"
  homepage "https://github.com/choplin/jira-cli-mcp"
  version "0.1.0"
  license "Apache-2.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/choplin/jira-cli-mcp/releases/download/v0.1.0/jira-cli-mcp-darwin-arm64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_DARWIN_ARM64" # darwin-arm64
    else
      url "https://github.com/choplin/jira-cli-mcp/releases/download/v0.1.0/jira-cli-mcp-darwin-x64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_DARWIN_X64" # darwin-x64
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/choplin/jira-cli-mcp/releases/download/v0.1.0/jira-cli-mcp-linux-arm64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_LINUX_ARM64" # linux-arm64
    else
      url "https://github.com/choplin/jira-cli-mcp/releases/download/v0.1.0/jira-cli-mcp-linux-x64.tar.gz"
      sha256 "PLACEHOLDER_SHA256_LINUX_X64" # linux-x64
    end
  end

  depends_on "jira-cli"

  def install
    binary_name = "jira-cli-mcp-#{OS.kernel_name.downcase}-#{Hardware::CPU.arch}"
    bin.install binary_name => "jira-cli-mcp"
  end

  test do
    # Test that the binary runs
    assert_match "MCP Server running", shell_output("#{bin}/jira-cli-mcp 2>&1", 1)
  end
end