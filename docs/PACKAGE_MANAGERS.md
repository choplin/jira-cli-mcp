# Package Manager Distribution

This document outlines how to distribute jira-cli-mcp through various package managers.

## Current Support

### Homebrew (macOS/Linux)
- Status: ✅ Implemented
- Installation: `brew tap choplin/jira-cli-mcp && brew install jira-cli-mcp`
- Formula location: `homebrew/jira-cli-mcp.rb`

## Future Package Managers

### AUR (Arch Linux)
- Status: 📋 Planned
- Package name: `jira-cli-mcp-bin`
- Required files:
  - `PKGBUILD`
  - `.SRCINFO`

Example PKGBUILD:
```bash
pkgname=jira-cli-mcp-bin
pkgver=0.1.0
pkgrel=1
pkgdesc="MCP server that wraps jira-cli for AI assistants"
arch=('x86_64' 'aarch64')
url="https://github.com/choplin/jira-cli-mcp"
license=('Apache')
depends=('jira-cli')
source_x86_64=("https://github.com/choplin/jira-cli-mcp/releases/download/v${pkgver}/jira-cli-mcp-linux-x64.tar.gz")
source_aarch64=("https://github.com/choplin/jira-cli-mcp/releases/download/v${pkgver}/jira-cli-mcp-linux-arm64.tar.gz")

package() {
  install -Dm755 "jira-cli-mcp-linux-${CARCH}" "${pkgdir}/usr/bin/jira-cli-mcp"
}
```

### Scoop (Windows)
- Status: 📋 Planned
- Bucket: `extras` or custom bucket
- Manifest: `jira-cli-mcp.json`

Example manifest:
```json
{
    "version": "0.1.0",
    "description": "MCP server that wraps jira-cli for AI assistants",
    "homepage": "https://github.com/choplin/jira-cli-mcp",
    "license": "Apache-2.0",
    "architecture": {
        "64bit": {
            "url": "https://github.com/choplin/jira-cli-mcp/releases/download/v0.1.0/jira-cli-mcp-windows-x64.zip",
            "hash": "sha256:..."
        }
    },
    "bin": "jira-cli-mcp.exe",
    "checkver": "github",
    "autoupdate": {
        "architecture": {
            "64bit": {
                "url": "https://github.com/choplin/jira-cli-mcp/releases/download/v$version/jira-cli-mcp-windows-x64.zip"
            }
        }
    }
}
```

### APT/DEB (Debian/Ubuntu)
- Status: 📋 Planned
- Options:
  1. PPA (Personal Package Archive)
  2. Direct .deb download
  3. Submit to official repositories

### RPM (Fedora/RHEL)
- Status: 📋 Planned
- Options:
  1. COPR repository
  2. Direct .rpm download
  3. Submit to official repositories

### Nix
- Status: 📋 Planned
- Package in nixpkgs
- Flake support

## Implementation Priority

1. **Homebrew** ✅ - Complete
2. **AUR** - Most requested by community
3. **Scoop** - For Windows users
4. **Nix** - Growing popularity
5. **APT/RPM** - Enterprise users

## Automation

Each package manager should be updated automatically via GitHub Actions when a new release is created. The `release.yml` workflow can be extended to handle each package manager.