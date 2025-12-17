# Privacy Statement

**Last Updated:** December 17, 2025

## Overview

Azure Updates MCP Server ("the Software") is designed to provide AI assistants with access to Azure service updates. This document describes how the Software handles data.

## Data Collection and Storage

### What Data We Collect

The Software accesses and stores the following data from the Azure Updates API:

- Azure service update titles and descriptions
- Update metadata (tags, categories, products, dates, status)
- Update identifiers and timestamps

### How We Store Data

- **Local Storage Only**: All data is stored locally in an SQLite database on your machine
- **No External Transmission**: The Software does not transmit any data to third parties (except when fetching from the official Azure Updates API)
- **No Personal Information**: The Software does not collect, store, or transmit any personal information about users

## Data Usage

### Purpose

Data fetched from the Azure Updates API is used solely for:

- Providing search and filtering capabilities to AI assistants
- Caching to improve response times
- Enabling offline access to previously synchronized updates

### NOT Used For

The Software does NOT:

- Use data for advertising or marketing purposes
- Sell, share, or transfer data to third parties
- Profile users or track user behavior
- Collect analytics or telemetry about usage patterns

## Data Retention

### Automatic Retention Policy

- Default retention period: Updates from 2022-01-01 onwards
- Configurable via `DATA_RETENTION_START_DATE` environment variable
- Older data is automatically deleted during synchronization

### User Control

Users can:

- Delete all data by removing the SQLite database file
- Adjust retention period via configuration
- Stop data synchronization at any time

## Third-Party Services

### Azure Updates API

The Software fetches data from Microsoft's Azure Updates API:

- **Endpoint**: `https://www.microsoft.com/releasecommunications/api/v2/azure`
- **Terms**: Subject to [Microsoft APIs Terms of Use](https://learn.microsoft.com/en-us/legal/microsoft-apis/terms-of-use)
- **Privacy**: See [Microsoft Privacy Statement](https://privacy.microsoft.com/en-us/privacystatement)

### No Other Services

The Software does not communicate with any other external services.

## Security

### Local Data Protection

- Data stored in SQLite database with standard file system permissions
- No encryption at rest (users should implement OS-level encryption if needed)
- No authentication or authorization (data is accessible to anyone with file system access)

### Network Security

- All API requests use HTTPS
- Implements retry logic with exponential backoff
- Respects standard HTTP error codes and rate limits

## Compliance

### Microsoft API Terms

Users of this Software must comply with:

- [Microsoft APIs Terms of Use](https://learn.microsoft.com/en-us/legal/microsoft-apis/terms-of-use)
- All applicable privacy and data protection laws
- Intellectual property rights

### Your Responsibilities

As a user of this Software, you are responsible for:

- Ensuring compliance with applicable laws in your jurisdiction
- Implementing appropriate data protection measures
- Respecting Microsoft's intellectual property rights in the data
- Not using the data for prohibited purposes (advertising, marketing, etc.)

## Changes to This Privacy Statement

We may update this Privacy Statement from time to time. Changes will be documented in the repository's commit history.

## Contact

For questions about this Privacy Statement or data handling practices:

- **GitHub Issues**: https://github.com/juyamagu/azure-updates-mcp-server/issues
- **Documentation**: See [docs/](../docs/) directory for technical details

## Disclaimer

This Software is provided "as is" without warranty of any kind. The developers are not responsible for:

- How you use the data accessed through this Software
- Compliance with applicable laws and regulations
- Data accuracy or availability from the upstream Azure Updates API
- Any damages arising from the use of this Software

By using this Software, you acknowledge that you have read and understood this Privacy Statement.
