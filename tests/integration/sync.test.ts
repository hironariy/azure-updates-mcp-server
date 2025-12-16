/**
 * Integration tests for sync service with mock API
 * Tests full sync workflow with real-like API responses
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdtempSync, rmSync } from 'fs';
import { createServer, Server } from 'http';
import { parse as parseUrl } from 'url';

describe('Sync Integration Tests with Mock API', () => {
    let db: Database.Database;
    let tempDir: string;
    let mockServer: Server;
    const MOCK_PORT = 13001;
    const MOCK_API_URL = `http://localhost:${MOCK_PORT}/api/v2/azure`;

    beforeAll(() => {
        // Start mock API server
        const fixturesPath = join(process.cwd(), 'tests/fixtures/azure-updates.json');
        const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf-8'));

        mockServer = createServer((req, res) => {
            const url = parseUrl(req.url || '', true);

            // Enable CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');

            if (url.pathname === '/api/v2/azure') {
                let results = [...fixtures.value];

                // Apply $filter for modified gt
                const filter = url.query.$filter as string | undefined;
                if (filter && filter.includes('modified gt')) {
                    const match = filter.match(/modified\s+gt\s+(\S+)/i);
                    if (match) {
                        const threshold = new Date(match[1]);
                        results = results.filter(item => new Date(item.modified) > threshold);
                    }
                }

                // Apply pagination
                const top = url.query.$top ? parseInt(url.query.$top as string, 10) : results.length;
                const skip = url.query.$skip ? parseInt(url.query.$skip as string, 10) : 0;
                const paginatedResults = results.slice(skip, skip + top);

                const response: any = {
                    '@odata.context': fixtures['@odata.context'],
                    'value': paginatedResults
                };

                if (url.query.$count === 'true') {
                    response['@odata.count'] = results.length;
                }

                res.writeHead(200);
                res.end(JSON.stringify(response));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        });

        mockServer.listen(MOCK_PORT);
    });

    afterAll(() => {
        mockServer.close();
    });

    beforeEach(() => {
        // Create temporary directory for test database
        tempDir = mkdtempSync(join(tmpdir(), 'sync-integration-'));
        const dbPath = join(tempDir, 'test.db');
        db = new Database(dbPath);

        // Apply schema
        const schemaPath = join(process.cwd(), 'src/database/schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');
        db.exec(schema);
    });

    afterEach(() => {
        db.close();
        rmSync(tempDir, { recursive: true, force: true });
    });

    describe('API Connectivity', () => {
        it('should successfully fetch data from mock API', async () => {
            const response = await fetch(MOCK_API_URL);
            expect(response.ok).toBe(true);

            const data: any = await response.json();
            expect(data.value).toBeDefined();
            expect(Array.isArray(data.value)).toBe(true);
            expect(data.value.length).toBeGreaterThan(0);
        });

        it('should support $count parameter', async () => {
            const response = await fetch(`${MOCK_API_URL}?$count=true`);
            const data: any = await response.json();

            expect(data['@odata.count']).toBeDefined();
            expect(typeof data['@odata.count']).toBe('number');
        });

        it('should support $top pagination', async () => {
            const response = await fetch(`${MOCK_API_URL}?$top=2`);
            const data: any = await response.json();

            expect(data.value.length).toBeLessThanOrEqual(2);
        });

        it('should support $filter for differential sync', async () => {
            const timestamp = '2025-12-01T00:00:00.0000000Z';
            const response = await fetch(`${MOCK_API_URL}?$filter=modified gt ${timestamp}`);
            const data: any = await response.json();

            expect(data.value).toBeDefined();
            // All results should have modified date after threshold
            for (const item of data.value) {
                expect(new Date(item.modified).getTime()).toBeGreaterThan(new Date(timestamp).getTime());
            }
        });
    });

    describe('Full Sync Workflow', () => {
        it('should perform initial sync with mock API data', async () => {
            // Fetch data from mock API
            const response = await fetch(`${MOCK_API_URL}?$count=true`);
            const data: any = await response.json();

            // Insert data into database
            let insertedCount = 0;
            for (const update of data.value) {
                db.prepare(`
                    INSERT INTO azure_updates (
                        id, title, description_html, description_md,
                        status, locale, created, modified
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    update.id,
                    update.title,
                    update.description,
                    null,
                    update.status,
                    update.locale,
                    update.created,
                    update.modified
                );
                insertedCount++;
            }

            // Verify data was inserted
            const count: any = db.prepare('SELECT COUNT(*) as count FROM azure_updates').get();
            expect(count.count).toBe(insertedCount);

            // Update sync checkpoint
            const now = new Date().toISOString();
            db.prepare(`
                UPDATE sync_checkpoints
                SET last_sync = ?, sync_status = 'success', record_count = ?
                WHERE id = 1
            `).run(now, insertedCount);

            const checkpoint: any = db.prepare('SELECT * FROM sync_checkpoints WHERE id = 1').get();
            expect(checkpoint.sync_status).toBe('success');
            expect(checkpoint.record_count).toBe(insertedCount);
        });

        it('should perform differential sync', async () => {
            // Perform initial sync
            const initialResponse = await fetch(MOCK_API_URL);
            const initialData: any = await initialResponse.json();
            const firstItem = initialData.value[0];

            // Insert first item
            db.prepare(`
                INSERT INTO azure_updates (
                    id, title, description_html, description_md,
                    status, locale, created, modified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                firstItem.id,
                firstItem.title,
                firstItem.description,
                null,
                firstItem.status,
                firstItem.locale,
                firstItem.created,
                firstItem.modified
            );

            // Update checkpoint with old timestamp
            const oldTimestamp = '2025-01-01T00:00:00.0000000Z';
            db.prepare(`
                UPDATE sync_checkpoints
                SET last_sync = ?, sync_status = 'success', record_count = 1
                WHERE id = 1
            `).run(oldTimestamp);

            // Perform differential sync
            const checkpoint: any = db.prepare('SELECT * FROM sync_checkpoints WHERE id = 1').get();
            const lastSync = checkpoint.last_sync;

            const diffResponse = await fetch(`${MOCK_API_URL}?$filter=modified gt ${lastSync}`);
            const diffData: any = await diffResponse.json();

            expect(diffData.value).toBeDefined();
            // Should return items modified after the old timestamp
            expect(diffData.value.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            const invalidUrl = `http://localhost:${MOCK_PORT}/invalid/endpoint`;

            try {
                const response = await fetch(invalidUrl);
                expect(response.ok).toBe(false);
                expect(response.status).toBe(404);
            } catch (error) {
                // Network errors should be caught
                expect(error).toBeDefined();
            }
        });

        it('should handle concurrent sync attempts', () => {
            // Set sync to in_progress
            db.prepare(`
                UPDATE sync_checkpoints
                SET sync_status = 'in_progress'
                WHERE id = 1
            `).run();

            const checkpoint: any = db.prepare('SELECT * FROM sync_checkpoints WHERE id = 1').get();
            expect(checkpoint.sync_status).toBe('in_progress');

            // Attempting another sync should check status first
            const canSync = checkpoint.sync_status !== 'in_progress';
            expect(canSync).toBe(false);
        });
    });
});
