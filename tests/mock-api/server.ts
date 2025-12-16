/**
 * Mock Azure Updates API Server
 * 
 * Express-based mock server for development and testing.
 * Serves fixture data from tests/fixtures/azure-updates.json
 * Supports OData $filter query for differential sync testing
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple HTTP server without external dependencies
import { createServer } from 'http';
import { parse as parseUrl } from 'url';

const FIXTURE_PATH = join(__dirname, '../fixtures/azure-updates.json');
const PORT = process.env.MOCK_API_PORT || 3001;

/**
 * Load fixture data
 */
function loadFixtures() {
    try {
        const content = readFileSync(FIXTURE_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Failed to load fixtures:', error);
        return {
            '@odata.context': 'https://www.microsoft.com/releasecommunications/api/v2/$metadata#azure',
            '@odata.count': 0,
            'value': []
        };
    }
}

/**
 * Parse OData $filter parameter (simplified implementation)
 * Supports: modified gt YYYY-MM-DDTHH:MM:SS.SSSZ
 */
function applyFilter(data: any[], filterQuery: string | null): any[] {
    if (!filterQuery) {
        return data;
    }

    // Support: modified gt 2025-01-15T00:00:00.000Z
    const modifiedGtMatch = filterQuery.match(/modified\s+gt\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)/i);
    if (modifiedGtMatch) {
        const threshold = new Date(modifiedGtMatch[1]);
        return data.filter(item => new Date(item.modified) > threshold);
    }

    // Support: tags/any(f:f eq 'Retirements')
    const tagsMatch = filterQuery.match(/tags\/any\(f:f\s+eq\s+'([^']+)'\)/i);
    if (tagsMatch) {
        const targetTag = tagsMatch[1];
        return data.filter(item => item.tags && item.tags.includes(targetTag));
    }

    // If filter is not recognized, return all data
    console.warn('Unsupported $filter query:', filterQuery);
    return data;
}

/**
 * Apply pagination
 */
function applyPagination(data: any[], top?: number, skip?: number): any[] {
    const skipCount = skip && !isNaN(skip) ? skip : 0;
    const takeCount = top && !isNaN(top) ? top : data.length;

    return data.slice(skipCount, skipCount + takeCount);
}

/**
 * Create HTTP server
 */
const server = createServer((req, res) => {
    const url = parseUrl(req.url || '', true);
    const pathname = url.pathname || '';

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Route: GET /api/v2/azure
    if (req.method === 'GET' && pathname === '/api/v2/azure') {
        const fixtures = loadFixtures();
        let results = fixtures.value || [];

        // Apply $filter
        const filter = url.query.$filter as string | undefined;
        if (filter) {
            results = applyFilter(results, filter);
        }

        // Apply $count
        const includeCount = url.query.$count === 'true';
        const totalCount = results.length;

        // Apply pagination
        const top = url.query.$top ? parseInt(url.query.$top as string, 10) : undefined;
        const skip = url.query.$skip ? parseInt(url.query.$skip as string, 10) : undefined;
        results = applyPagination(results, top, skip);

        const response: any = {
            '@odata.context': fixtures['@odata.context'],
            'value': results
        };

        if (includeCount) {
            response['@odata.count'] = totalCount;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response, null, 2));
        return;
    }

    // Route: GET /api/v2/$metadata (minimal response)
    if (req.method === 'GET' && pathname === '/api/v2/$metadata') {
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(`<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
  <edmx:DataServices>
    <Schema Namespace="MockAzureUpdates" xmlns="http://docs.oasis-open.org/odata/ns/edm">
      <EntityType Name="AzureUpdate">
        <Key><PropertyRef Name="id"/></Key>
        <Property Name="id" Type="Edm.String" Nullable="false"/>
        <Property Name="title" Type="Edm.String"/>
        <Property Name="description" Type="Edm.String"/>
        <Property Name="modified" Type="Edm.DateTimeOffset" Nullable="false"/>
      </EntityType>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>`);
        return;
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

/**
 * Start server
 */
server.listen(PORT, () => {
    console.log(`Mock Azure Updates API server running at http://localhost:${PORT}`);
    console.log(`Endpoint: http://localhost:${PORT}/api/v2/azure`);
    console.log(`Fixture data loaded: ${loadFixtures().value.length} records`);
});

export { server };
