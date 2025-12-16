# Development Guide

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Setup

```bash
# Clone repository
git clone https://github.com/your-org/azure-updates-mcp-server.git
cd azure-updates-mcp-server

# Install dependencies
npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Build
npm run build

# Run in development mode
npm run dev

# Lint
npm run lint
npm run lint:fix
```

## Project Structure

```
azure-updates-mcp-server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # MCP server setup
│   ├── database/                # Database layer
│   │   ├── database.ts          # SQLite initialization
│   │   ├── schema.sql           # Database schema
│   │   └── queries.ts           # Prepared statements
│   ├── services/                # Business logic
│   │   ├── azure-api.service.ts # Azure API client
│   │   ├── sync.service.ts      # Sync orchestration
│   │   ├── search.service.ts    # Search implementation
│   │   └── html-converter.service.ts # HTML to Markdown
│   ├── tools/                   # MCP tools
│   │   └── search-azure-updates.tool.ts
│   ├── resources/               # MCP resources
│   │   └── guide.resource.ts
│   ├── models/                  # TypeScript interfaces
│   │   ├── azure-update.ts
│   │   ├── search-query.ts
│   │   └── sync-checkpoint.ts
│   └── utils/                   # Utilities
│       ├── logger.ts
│       ├── retry.ts
│       └── staleness.ts
├── tests/                       # Test suite
├── data/                        # Database storage
└── docs/                        # Documentation
```

## Testing & Debugging

### MCP Inspector

Test your MCP server interactively using the official MCP Inspector tool:

```bash
# Test with TypeScript source (during development)
npm run inspect

# Test built version (before publishing)
npm run inspect:build
```

The Inspector opens at `http://127.0.0.1:6274` and provides:

- **Resources Tab**: View `azure-updates://guide` metadata
- **Tools Tab**: Test `search_azure_updates` with custom parameters
- **Notifications**: Monitor server logs and protocol messages
- **Export Config**: Generate Claude Desktop configuration

### Local Package Testing

Test the package as it will be published:

```bash
# Create package tarball
npm run build
npm pack

# Install globally from tarball
npm install -g ./azure-updates-mcp-server-0.1.0.tgz

# Test the command
azure-updates-mcp-server

# Cleanup
npm uninstall -g azure-updates-mcp-server
```

### Integration Testing with Claude Desktop

For local development, use `npm link`:

```bash
# Link package globally
npm run build
npm link

# Update claude_desktop_config.json to use linked version
{
  "mcpServers": {
    "azure-updates": {
      "command": "azure-updates-mcp-server",
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  }
}

# Restart Claude Desktop
# Make changes, rebuild, and test immediately
npm run build

# Cleanup when done
npm unlink -g azure-updates-mcp-server
```

## Performance Metrics

- **Query Latency**: p95 < 500ms for keyword search + filters
- **Simple Filters**: p95 < 200ms (no keyword search)
- **Sync Throughput**: >100 records/sec
- **Database Size**: ~50-100MB for 10k records
- **Memory Footprint**: <100MB

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`) and linting (`npm run lint`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.
