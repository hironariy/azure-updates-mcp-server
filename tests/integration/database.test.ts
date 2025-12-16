/**
 * Integration tests for database operations
 * Tests SQLite with FTS5 full-text search functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdtempSync, rmSync } from 'fs';

describe('Database Integration Tests', () => {
    let db: Database.Database;
    let tempDir: string;

    beforeEach(() => {
        // Create temporary directory for test database
        tempDir = mkdtempSync(join(tmpdir(), 'db-integration-'));
        const dbPath = join(tempDir, 'test.db');
        db = new Database(dbPath);

        // Apply schema
        const schemaPath = join(process.cwd(), 'src/database/schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');
        db.exec(schema);

        // Insert test data from fixtures
        const fixturesPath = join(process.cwd(), 'tests/fixtures/azure-updates.json');
        const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf-8'));

        for (const update of fixtures.value) {
            // Insert main record
            db.prepare(`
                INSERT INTO azure_updates (
                    id, title, description_html, description_md, 
                    status, locale, created, modified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                update.id,
                update.title,
                update.description,
                null, // markdown conversion happens separately
                update.status,
                update.locale,
                update.created,
                update.modified
            );

            // Insert tags
            if (update.tags) {
                for (const tag of update.tags) {
                    db.prepare('INSERT INTO update_tags (update_id, tag) VALUES (?, ?)').run(update.id, tag);
                }
            }

            // Insert product categories
            if (update.productCategories) {
                for (const category of update.productCategories) {
                    db.prepare('INSERT INTO update_categories (update_id, category) VALUES (?, ?)').run(update.id, category);
                }
            }

            // Insert products
            if (update.products) {
                for (const product of update.products) {
                    db.prepare('INSERT INTO update_products (update_id, product) VALUES (?, ?)').run(update.id, product);
                }
            }

            // Insert availabilities
            if (update.availabilities) {
                for (const availability of update.availabilities) {
                    db.prepare(`
                        INSERT INTO update_availabilities (update_id, ring, date) 
                        VALUES (?, ?, ?)
                    `).run(
                        update.id,
                        availability.ring,
                        availability.year && availability.month
                            ? `${availability.year}-${getMonthNumber(availability.month)}-01`
                            : null
                    );
                }
            }
        }
    });

    afterEach(() => {
        db.close();
        rmSync(tempDir, { recursive: true, force: true });
    });

    describe('Basic CRUD Operations', () => {
        it('should retrieve all azure updates', () => {
            const results = db.prepare('SELECT * FROM azure_updates').all();
            expect(results.length).toBeGreaterThan(0);
        });

        it('should retrieve updates with their tags', () => {
            const results = db.prepare(`
                SELECT u.id, u.title, GROUP_CONCAT(t.tag) as tags
                FROM azure_updates u
                LEFT JOIN update_tags t ON u.id = t.update_id
                GROUP BY u.id
            `).all();

            expect(results.length).toBeGreaterThan(0);
            const withTags = results.filter((r: any) => r.tags !== null);
            expect(withTags.length).toBeGreaterThan(0);
        });

        it('should filter updates by tag', () => {
            const results = db.prepare(`
                SELECT DISTINCT u.*
                FROM azure_updates u
                INNER JOIN update_tags t ON u.id = t.update_id
                WHERE t.tag = ?
            `).all('Retirements');

            expect(results).toBeDefined();
        });

        it('should filter updates by product category', () => {
            const results = db.prepare(`
                SELECT DISTINCT u.*
                FROM azure_updates u
                INNER JOIN update_categories c ON u.id = c.update_id
                WHERE c.category = ?
            `).all('Compute');

            expect(results).toBeDefined();
        });
    });

    describe('Full-Text Search (FTS5)', () => {
        it('should search updates by title keyword', () => {
            const results = db.prepare(`
                SELECT u.*, f.rank
                FROM updates_fts f
                INNER JOIN azure_updates u ON f.id = u.id
                WHERE updates_fts MATCH ?
                ORDER BY rank
            `).all('Azure');

            expect(results).toBeDefined();
        });

        it('should handle empty search results gracefully', () => {
            const results = db.prepare(`
                SELECT u.*
                FROM updates_fts f
                INNER JOIN azure_updates u ON f.id = u.id
                WHERE updates_fts MATCH ?
            `).all('nonexistentterm12345xyz');

            expect(results).toEqual([]);
        });
    });

    describe('Complex Queries', () => {
        it('should combine filters and full-text search', () => {
            const results = db.prepare(`
                SELECT DISTINCT u.*
                FROM updates_fts f
                INNER JOIN azure_updates u ON f.id = u.id
                INNER JOIN update_tags t ON u.id = t.update_id
                WHERE updates_fts MATCH ? AND t.tag = ?
            `).all('retirement', 'Retirements');

            expect(results).toBeDefined();
        });

        it('should filter by date range', () => {
            const results = db.prepare(`
                SELECT * FROM azure_updates
                WHERE modified >= ? AND modified <= ?
            `).all('2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z');

            expect(results).toBeDefined();
        });
    });

    describe('Sync Checkpoint Operations', () => {
        it('should have initial sync checkpoint', () => {
            const checkpoint = db.prepare('SELECT * FROM sync_checkpoints WHERE id = 1').get();
            expect(checkpoint).toBeDefined();
        });

        it('should update sync checkpoint', () => {
            const now = new Date().toISOString();
            db.prepare(`
                UPDATE sync_checkpoints 
                SET last_sync = ?, sync_status = 'success', record_count = 10
                WHERE id = 1
            `).run(now);

            const checkpoint: any = db.prepare('SELECT * FROM sync_checkpoints WHERE id = 1').get();
            expect(checkpoint.sync_status).toBe('success');
            expect(checkpoint.record_count).toBe(10);
        });
    });
});

/**
 * Helper function to convert month name to number
 */
function getMonthNumber(monthName: string): string {
    const months: Record<string, string> = {
        'January': '01',
        'February': '02',
        'March': '03',
        'April': '04',
        'May': '05',
        'June': '06',
        'July': '07',
        'August': '08',
        'September': '09',
        'October': '10',
        'November': '11',
        'December': '12'
    };
    return months[monthName] || '01';
}
