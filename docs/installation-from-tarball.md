# Installation from Tarball Package

This guide explains how to install the Azure Updates MCP Server from a pre-built tarball package (`.tgz` file). This method is useful for internal distribution or air-gapped environments.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Step 1: Obtain the Tarball Package

Get the `azure-updates-mcp-server-{version}.tgz` file from your internal distribution channel or build it yourself:

```bash
# Clone the repository
git clone https://github.com/juyamagu/azure-updates-mcp-server.git
cd azure-updates-mcp-server

# Install dependencies and build
npm install
npm run build

# Create tarball package
npm run package
```

This will create `azure-updates-mcp-server-{version}.tgz` in the current directory.

## Step 2: Install Globally

Install the tarball package globally:

```bash
npm install -g ./azure-updates-mcp-server-{version}.tgz
```

Or specify the full path:

```bash
npm install -g /path/to/azure-updates-mcp-server-{version}.tgz
```

## Step 3: Configure VS Code

Add this to your `.vscode/mcp.json`:

```jsonc
{
  "servers": {
    "azure-updates-mcp": {
      "command": "azure-updates-mcp-server"
      // Optional environment variables:
      // "env": {
      //   "DATABASE_PATH": "${workspaceFolder}/.azure-updates/data.db",
      //   "SYNC_STALENESS_HOURS": "24",
      //   "LOG_LEVEL": "info"
      // }
    }
  }
}
```

## Alternative: Using npx with Tarball

You can also run the server directly with npx without global installation:

```jsonc
{
  "servers": {
    "azure-updates-mcp": {
      "command": "npx",
      "args": ["/path/to/azure-updates-mcp-server-{version}.tgz"]
    }
  }
}
```

Or use a relative path:

```jsonc
{
  "servers": {
    "azure-updates-mcp": {
      "command": "npx",
      "args": ["~/azure-updates-mcp-server-{version}.tgz"]
    }
  }
}
```

## Verification

Verify the installation:

```bash
# Check version
azure-updates-mcp-server --version

# Check if the command is available
which azure-updates-mcp-server
```

## Updating

To update to a newer version:

```bash
# Uninstall old version
npm uninstall -g azure-updates-mcp-server

# Install new version
npm install -g ./azure-updates-mcp-server-{new-version}.tgz
```

## Uninstalling

To remove the globally installed package:

```bash
npm uninstall -g azure-updates-mcp-server
```

## Troubleshooting

### Command not found after installation

If the `azure-updates-mcp-server` command is not found after installation, check your npm global bin path:

```bash
npm config get prefix
```

Ensure this directory is in your PATH environment variable.

### Permission errors

On Linux/macOS, you may need to use `sudo`:

```bash
sudo npm install -g ./azure-updates-mcp-server-{version}.tgz
```

Or configure npm to use a user-writable directory:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## See Also

- [Development Guide](./development.md) - For development setup
- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
- [Main README](../README.md) - For GitHub-based installation
