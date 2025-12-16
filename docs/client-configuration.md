# MCP Client Configuration

This guide covers how to configure various MCP clients to use the Azure Updates MCP Server.

## Claude Desktop

Add to `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "azure-updates": {
      "command": "npx",
      "args": ["-y", "azure-updates-mcp-server"],
      "env": {
        "DATABASE_PATH": "${HOME}/.azure-updates-mcp/data.db",
        "SYNC_STALENESS_HOURS": "24",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Continue.dev

Add to `.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "azure-updates",
      "command": "npx",
      "args": ["-y", "azure-updates-mcp-server"],
      "env": {
        "DATABASE_PATH": "${workspaceFolder}/.azure-updates/data.db",
        "SYNC_STALENESS_HOURS": "24"
      }
    }
  ]
}
```

## Cline (VS Code Extension)

Add to VS Code settings (`settings.json`):

```json
{
  "cline.mcpServers": {
    "azure-updates": {
      "command": "npx",
      "args": ["-y", "azure-updates-mcp-server"],
      "env": {
        "DATABASE_PATH": "${workspaceFolder}/.azure-updates/data.db"
      }
    }
  }
}
```

## Configuration Options

See [Configuration](../README.md#configuration) in the main README for all available environment variables.
