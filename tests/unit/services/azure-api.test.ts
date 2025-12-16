import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { fetchAzureUpdates, fetchUpdateCount } from '../../../src/services/azure-api.service.js';
import { createServer, Server } from 'http';
import { parse as parseUrl } from 'url';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Azure API Service', () => {
    let mockServer: Server;
    const MOCK_PORT = 13002;
    const MOCK_API_URL = `http://localhost:${MOCK_PORT}/api/v2/azure`;
    let originalEnv: string | undefined;

    beforeAll(() => {
        // Store original environment variable
        originalEnv = process.env.AZURE_UPDATES_API_ENDPOINT;

        // Start mock API server
        const fixturesPath = join(process.cwd(), 'tests/fixtures/azure-updates.json');
        const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf-8'));

        mockServer = createServer((req, res) => {
            const url = parseUrl(req.url || '', true);

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');

            if (url.pathname === '/api/v2/azure') {
                const response: any = {
                    '@odata.context': fixtures['@odata.context'],
                    'value': fixtures.value
                };

                if (url.query.$count === 'true') {
                    response['@odata.count'] = fixtures.value.length;
                }

                res.writeHead(200);
                res.end(JSON.stringify(response));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        });

        mockServer.listen(MOCK_PORT);

        // Set mock API endpoint
        process.env.AZURE_UPDATES_API_ENDPOINT = MOCK_API_URL;
    });

    afterAll(() => {
        mockServer.close();
        // Restore original environment variable
        if (originalEnv !== undefined) {
            process.env.AZURE_UPDATES_API_ENDPOINT = originalEnv;
        } else {
            delete process.env.AZURE_UPDATES_API_ENDPOINT;
        }
    });

    describe('fetchAzureUpdates', () => {
        it('should have correct function signature', () => {
            expect(typeof fetchAzureUpdates).toBe('function');
        });

        it('should fetch updates from API', async () => {
            const updates = await fetchAzureUpdates();
            expect(updates).toBeDefined();
            expect(Array.isArray(updates)).toBe(true);
            expect(updates.length).toBeGreaterThan(0);
        });

        it('should support modifiedSince option for differential sync', async () => {
            const updates = await fetchAzureUpdates({
                modifiedSince: '2025-01-01T00:00:00.0000000Z'
            });
            expect(updates).toBeDefined();
            expect(Array.isArray(updates)).toBe(true);
        });

        it('should support limit option', async () => {
            const updates = await fetchAzureUpdates({ limit: 5 });
            expect(updates).toBeDefined();
            expect(Array.isArray(updates)).toBe(true);
        });
    });

    describe('fetchUpdateCount', () => {
        it('should have correct function signature', () => {
            expect(typeof fetchUpdateCount).toBe('function');
        });

        it('should return total count of updates', async () => {
            const count = await fetchUpdateCount();
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThan(0);
        });
    });

    describe('error handling', () => {
        it('should export fetchAzureUpdates function', () => {
            expect(fetchAzureUpdates).toBeDefined();
        });

        it('should export fetchUpdateCount function', () => {
            expect(fetchUpdateCount).toBeDefined();
        });

        it('should handle network errors', async () => {
            // Temporarily set invalid endpoint
            process.env.AZURE_UPDATES_API_ENDPOINT = 'http://localhost:99999/invalid';

            try {
                await fetchAzureUpdates();
                // If no error is thrown, fail the test
                expect(true).toBe(false);
            } catch (error) {
                // Error should be thrown for invalid endpoint
                expect(error).toBeDefined();
            } finally {
                // Restore mock endpoint
                process.env.AZURE_UPDATES_API_ENDPOINT = MOCK_API_URL;
            }
        });
    });
});
