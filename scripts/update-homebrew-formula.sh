#!/bin/bash
# Script to update Homebrew formula with new release information

set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 0.1.0"
    exit 1
fi

VERSION=$1
FORMULA_PATH="homebrew/jira-cli-mcp.rb"

echo "Updating Homebrew formula for version $VERSION..."

# Function to get SHA256 for a URL
get_sha256() {
    local url=$1
    local filename=$(basename "$url")
    
    echo "Downloading $url..."
    curl -sL "$url" -o "$filename"
    
    local sha256=$(shasum -a 256 "$filename" | awk '{print $1}')
    rm "$filename"
    
    echo "$sha256"
}

# Base URL for releases
BASE_URL="https://github.com/choplin/jira-cli-mcp/releases/download/v${VERSION}"

# Get SHA256 for each platform
echo "Getting SHA256 checksums..."
DARWIN_ARM64_SHA=$(get_sha256 "${BASE_URL}/jira-cli-mcp-darwin-arm64.tar.gz")
DARWIN_X64_SHA=$(get_sha256 "${BASE_URL}/jira-cli-mcp-darwin-x64.tar.gz")
LINUX_ARM64_SHA=$(get_sha256 "${BASE_URL}/jira-cli-mcp-linux-arm64.tar.gz")
LINUX_X64_SHA=$(get_sha256 "${BASE_URL}/jira-cli-mcp-linux-x64.tar.gz")

# Update formula
echo "Updating formula..."
sed -i.bak "s/version \".*\"/version \"$VERSION\"/" "$FORMULA_PATH"
sed -i.bak "s|download/v[0-9.]*|download/v$VERSION|g" "$FORMULA_PATH"
sed -i.bak "s/sha256 \"[a-f0-9]*\" # darwin-arm64/sha256 \"$DARWIN_ARM64_SHA\" # darwin-arm64/" "$FORMULA_PATH"
sed -i.bak "s/sha256 \"[a-f0-9]*\" # darwin-x64/sha256 \"$DARWIN_X64_SHA\" # darwin-x64/" "$FORMULA_PATH"
sed -i.bak "s/sha256 \"[a-f0-9]*\" # linux-arm64/sha256 \"$LINUX_ARM64_SHA\" # linux-arm64/" "$FORMULA_PATH"
sed -i.bak "s/sha256 \"[a-f0-9]*\" # linux-x64/sha256 \"$LINUX_X64_SHA\" # linux-x64/" "$FORMULA_PATH"

# Clean up backup files
rm "${FORMULA_PATH}.bak"

echo "Formula updated successfully!"
echo ""
echo "SHA256 checksums:"
echo "  darwin-arm64: $DARWIN_ARM64_SHA"
echo "  darwin-x64:   $DARWIN_X64_SHA"
echo "  linux-arm64:  $LINUX_ARM64_SHA"
echo "  linux-x64:    $LINUX_X64_SHA"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff $FORMULA_PATH"
echo "2. Copy the formula to your homebrew-jira-cli-mcp tap repository"
echo "3. Commit and push the changes"