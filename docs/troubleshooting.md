# Troubleshooting

## Server won't start

- Check Node.js version: `node --version` (must be 18+)
- Verify database path has write permissions
- Review logs with `LOG_LEVEL=debug`

## Sync failures

- Check network connectivity to `www.microsoft.com`
- Increase timeout: `SYNC_TIMEOUT_MS=60000`
- Review error logs for API rate limiting (429 errors)

## Slow queries

- Verify database indices: Check `schema.sql` applied correctly
- Analyze database: `ANALYZE` command runs automatically
- Review query patterns: Complex filters may require optimization

## MCP client integration issues

- Verify stdio transport is configured (not HTTP)
- Check environment variables are set correctly
- Review MCP client logs for connection errors
- Test with `npm start` directly to isolate client issues

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/azure-updates-mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/azure-updates-mcp-server/discussions)
- **Documentation**: [docs/](.)
