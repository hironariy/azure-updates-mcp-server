# Changelog

All notable changes to Azure Updates MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Pre-populated database snapshot for instant startup
- Semantic search with embedding-based similarity matching
- Export functionality (JSON, CSV, Markdown)
- Historical versioning of updates
- Multi-language support

## [1.0.0] - 2025-12-16

### Added

- **Natural Language Search**: Full-text search across Azure updates using FTS5 with BM25 relevance ranking
- **Simplified Filtering**: Filter by tags, product categories, products, status, availability rings, and date ranges—no OData syntax required
- **Automatic Data Synchronization**: Differential sync with Azure Updates API using `modified` timestamp field
- **Fast Local Queries**: SQLite replication with optimized indices ensures <500ms p95 query latency
- **Rich Metadata Exposure**: MCP resource (`azure-updates://guide`) provides available filter values and data freshness
- **MCP Tool**: Single unified `search_azure_updates` tool for all query types (search, filter, get-by-ID)
- **Configurable Sync**: Control sync frequency and staleness threshold via environment variables
- **Non-Blocking Startup**: Server starts immediately with MCP tools available; sync runs in background
- **HTML to Markdown Conversion**: Automatic conversion of update descriptions for LLM-friendly consumption
- **Retry Logic**: Exponential backoff for API calls with configurable retry attempts
- **Structured Logging**: JSON-formatted logs with timing metrics and context
- **TypeScript Strict Mode**: Full type safety and compile-time guarantees
- **Comprehensive Test Suite**: Unit and integration tests with Vitest
- **ESLint Configuration**: Enforces code quality (complexity ≤10, no `any` types)

### Technical Details

- Built with `@modelcontextprotocol/sdk` v1.25.0
- SQLite with `better-sqlite3` v12.5.0 (FTS5 full-text search)
- HTML conversion with `turndown` v7.2.2
- Node.js 18+ runtime with ES modules
- TypeScript 5.x with strict mode
- Vitest for testing with coverage

### Performance

- Query latency: p95 < 500ms (keyword search + filters)
- Simple filter queries: p95 < 200ms
- Sync throughput: >100 records/sec
- Database size: ~50-100MB for 10k records
- Memory footprint: <100MB

## [0.1.0] - 2025-12-16

### Added

- Initial development version
- Basic MCP server setup with stdio transport
- Database schema with 7 tables (azure_updates, update_tags, update_categories, update_products, update_availabilities, updates_fts, sync_checkpoints)
- FTS5 full-text search configuration
- Basic search and filter functionality

---

## Version History Summary

- **1.0.0** (2025-12-16): First stable release with full feature set
- **0.1.0** (2025-12-16): Initial development version

## Release Notes Format

Each release follows this structure:

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on proposing changes.
