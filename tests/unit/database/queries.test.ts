import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
    upsertUpdate,
    getUpdateById,
    replaceUpdateTags,
    replaceUpdateCategories,
    replaceUpdateProducts,
    replaceUpdateAvailabilities,
    getSyncCheckpoint,
    startSync,
    completeSyncSuccess,
    completeSyncFailure,
    getAllTags,
    getAllCategories,
    getAllProducts,
    getAllAvailabilityRings,
    getAllStatuses,
    getUpdateCount,
    deleteUpdatesBeforeRetentionDate,
} from '../../../src/database/queries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Database Queries', () => {
    let db: Database.Database;

    beforeEach(() => {
        db = new Database(':memory:');
        const schemaPath = join(__dirname, '../../../src/database/schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');
        db.exec(schema);
    });

    describe('upsertUpdate', () => {
        it('should insert new update', () => {
            upsertUpdate(db, {
                id: 'test-1',
                title: 'Test Update',
                description_html: '<p>Test</p>',
                description_md: 'Test',
                status: 'Active',
                locale: null,
                created: '2025-01-01T00:00:00Z',
                modified: '2025-01-01T00:00:00Z',
                metadata: null,
            });

            const result = getUpdateById(db, 'test-1');
            expect(result).toBeDefined();
            expect(result?.title).toBe('Test Update');
        });

        it('should update existing update', () => {
            upsertUpdate(db, {
                id: 'test-1',
                title: 'Original Title',
                description_html: '<p>Test</p>',
                description_md: 'Test',
                status: 'Active',
                locale: null,
                created: '2025-01-01T00:00:00Z',
                modified: '2025-01-01T00:00:00Z',
                metadata: null,
            });

            upsertUpdate(db, {
                id: 'test-1',
                title: 'Updated Title',
                description_html: '<p>Updated</p>',
                description_md: 'Updated',
                status: 'Active',
                locale: null,
                created: '2025-01-01T00:00:00Z',
                modified: '2025-01-02T00:00:00Z',
                metadata: null,
            });

            const result = getUpdateById(db, 'test-1');
            expect(result?.title).toBe('Updated Title');
        });
    });

    describe('replaceUpdateTags', () => {
        beforeEach(() => {
            upsertUpdate(db, {
                id: 'test-1',
                title: 'Test',
                description_html: '',
                description_md: '',
                status: null,
                locale: null,
                created: '2025-01-01T00:00:00Z',
                modified: '2025-01-01T00:00:00Z',
                metadata: null,
            });
        });

        it('should add tags to update', () => {
            replaceUpdateTags(db, 'test-1', ['Security', 'Features']);

            const update = getUpdateById(db, 'test-1');
            expect(update?.tags).toEqual(['Features', 'Security']);
        });

        it('should replace existing tags', () => {
            replaceUpdateTags(db, 'test-1', ['Tag1', 'Tag2']);
            replaceUpdateTags(db, 'test-1', ['Tag3']);

            const update = getUpdateById(db, 'test-1');
            expect(update?.tags).toEqual(['Tag3']);
        });
    });

    describe('sync checkpoint operations', () => {
        it('should get initial sync checkpoint', () => {
            const checkpoint = getSyncCheckpoint(db);
            expect(checkpoint).toBeDefined();
            expect(checkpoint?.lastSync).toBe('1970-01-01T00:00:00.0000000Z');
            expect(checkpoint?.syncStatus).toBe('success');
        });

        it('should start sync successfully', () => {
            const result = startSync(db);
            expect(result).toBe(true);

            const checkpoint = getSyncCheckpoint(db);
            expect(checkpoint?.syncStatus).toBe('in_progress');
        });

        it('should prevent concurrent syncs', () => {
            startSync(db);
            const result = startSync(db);
            expect(result).toBe(false);
        });

        it('should complete sync successfully', () => {
            startSync(db);
            completeSyncSuccess(db, '2025-01-01T00:00:00Z', 100, 1000);

            const checkpoint = getSyncCheckpoint(db);
            expect(checkpoint?.syncStatus).toBe('success');
            expect(checkpoint?.recordCount).toBe(100);
            expect(checkpoint?.durationMs).toBe(1000);
        });

        it('should mark sync as failed', () => {
            startSync(db);
            completeSyncFailure(db, 'Test error');

            const checkpoint = getSyncCheckpoint(db);
            expect(checkpoint?.syncStatus).toBe('failed');
            expect(checkpoint?.errorMessage).toBe('Test error');
        });
    });

    describe('metadata queries', () => {
        beforeEach(() => {
            upsertUpdate(db, {
                id: 'test-1',
                title: 'Test',
                description_html: '',
                description_md: '',
                status: 'Active',
                locale: null,
                created: '2025-01-01T00:00:00Z',
                modified: '2025-01-01T00:00:00Z',
                metadata: null,
            });

            replaceUpdateTags(db, 'test-1', ['Security', 'Features']);
            replaceUpdateCategories(db, 'test-1', ['Compute', 'Databases']);
            replaceUpdateProducts(db, 'test-1', ['Azure VM']);
        });

        it('should get all distinct tags', () => {
            const tags = getAllTags(db);
            expect(tags).toEqual(['Features', 'Security']);
        });

        it('should get all distinct categories', () => {
            const categories = getAllCategories(db);
            expect(categories).toEqual(['Compute', 'Databases']);
        });

        it('should get all distinct products', () => {
            const products = getAllProducts(db);
            expect(products).toEqual(['Azure VM']);
        });

        it('should get update count', () => {
            const count = getUpdateCount(db);
            expect(count).toBe(1);
        });

        it('should handle empty results', () => {
            // Create fresh database
            const emptyDb = new Database(':memory:');
            const schemaPath = join(__dirname, '../../../src/database/schema.sql');
            const schema = readFileSync(schemaPath, 'utf-8');
            emptyDb.exec(schema);

            expect(getAllTags(emptyDb)).toEqual([]);
            expect(getAllCategories(emptyDb)).toEqual([]);
            expect(getAllProducts(emptyDb)).toEqual([]);
            expect(getUpdateCount(emptyDb)).toBe(0);
        });
    });

    describe('availability queries', () => {
        it('should get all availability rings', () => {
            upsertUpdate(db, {
                id: 'test-avail',
                title: 'Test Availability',
                description_html: '',
                description_md: '',
                status: 'Active',
                locale: null,
                created: '2025-01-01T00:00:00Z',
                modified: '2025-01-01T00:00:00Z',
                metadata: null,
            });

            replaceUpdateAvailabilities(db, 'test-avail', [
                { ring: 'Preview', date: '2025-01-01' },
                { ring: 'General Availability', date: '2025-06-01' },
            ]);

            const rings = getAllAvailabilityRings(db);
            expect(rings).toContain('Preview');
            expect(rings).toContain('General Availability');
        });
    });

    describe('status queries', () => {
        it('should get all distinct statuses', () => {
            upsertUpdate(db, {
                id: 'test-status-1',
                title: 'Active Update',
                description_html: '',
                description_md: '',
                status: 'Active',
                locale: null,
                created: '2025-01-01T00:00:00Z',
                modified: '2025-01-01T00:00:00Z',
                metadata: null,
            });

            upsertUpdate(db, {
                id: 'test-status-2',
                title: 'Retired Update',
                description_html: '',
                description_md: '',
                status: 'Retired',
                locale: null,
                created: '2025-01-01T00:00:00Z',
                modified: '2025-01-01T00:00:00Z',
                metadata: null,
            });

            const statuses = getAllStatuses(db);
            expect(statuses).toContain('Active');
            expect(statuses).toContain('Retired');
        });
    });

    describe('retention date filtering', () => {
        it('should delete updates older than retention start date', () => {
            // Insert old update (2019)
            upsertUpdate(db, {
                id: 'old-update',
                title: 'Old Update',
                description_html: '',
                description_md: '',
                status: 'Retired',
                locale: null,
                created: '2019-01-01T00:00:00Z',
                modified: '2019-06-01T00:00:00Z',
                metadata: null,
            });

            // Insert recent update (2023)
            upsertUpdate(db, {
                id: 'recent-update',
                title: 'Recent Update',
                description_html: '',
                description_md: '',
                status: 'Active',
                locale: null,
                created: '2023-01-01T00:00:00Z',
                modified: '2023-06-01T00:00:00Z',
                metadata: null,
            });

            const beforeCount = getUpdateCount(db);
            expect(beforeCount).toBe(2);

            // Delete updates before 2022-01-01
            const deletedCount = deleteUpdatesBeforeRetentionDate(db, '2022-01-01');
            expect(deletedCount).toBe(1);

            const afterCount = getUpdateCount(db);
            expect(afterCount).toBe(1);

            // Verify old update is deleted
            const oldUpdate = getUpdateById(db, 'old-update');
            expect(oldUpdate).toBeNull();

            // Verify recent update still exists
            const recentUpdate = getUpdateById(db, 'recent-update');
            expect(recentUpdate).toBeDefined();
            expect(recentUpdate?.id).toBe('recent-update');
        });

        it('should retain updates with modified date after retention start date', () => {
            // Insert update created before retention date but modified after
            upsertUpdate(db, {
                id: 'updated-old',
                title: 'Updated Old Update',
                description_html: '',
                description_md: '',
                status: 'Active',
                locale: null,
                created: '2018-01-01T00:00:00Z',
                modified: '2024-01-01T00:00:00Z',
                metadata: null,
            });

            const beforeCount = getUpdateCount(db);
            expect(beforeCount).toBe(1);

            // Delete updates before 2022-01-01
            const deletedCount = deleteUpdatesBeforeRetentionDate(db, '2022-01-01');
            expect(deletedCount).toBe(0);

            const afterCount = getUpdateCount(db);
            expect(afterCount).toBe(1);

            // Verify update still exists (modified date is recent)
            const update = getUpdateById(db, 'updated-old');
            expect(update).toBeDefined();
        });

        it('should handle empty database gracefully', () => {
            const deletedCount = deleteUpdatesBeforeRetentionDate(db, '2022-01-01');
            expect(deletedCount).toBe(0);
        });
    });
});

