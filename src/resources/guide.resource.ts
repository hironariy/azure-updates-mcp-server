/**
 * MCP Resource: Azure Updates Search Guide
 * 
 * Provides metadata and usage guidance for the search_azure_updates tool.
 * This resource is automatically included in LLM context by MCP-aware clients.
 */

import type Database from 'better-sqlite3';
import {
    getAllTags,
    getAllCategories,
    getAllProducts,
    getAllAvailabilityRings,
    getAllStatuses,
    getUpdateCount,
    getSyncCheckpoint,
} from '../database/queries.js';
import * as logger from '../utils/logger.js';

/**
 * Guide resource data structure
 */
export interface GuideResourceData {
    overview: string;
    dataAvailability: {
        retentionStartDate: string | null;
        note: string;
    };
    availableFilters: {
        tags: string[];
        productCategories: string[];
        products: string[];
        statuses: string[];
        availabilityRings: string[];
    };
    usageExamples: Array<{
        description: string;
        query: unknown;
    }>;
    dataFreshness: {
        lastSync: string;
        hoursSinceSync: number;
        totalRecords: number;
        syncStatus: string;
    };
    queryTips: string[];
}

/**
 * Generate the guide resource content
 * 
 * T066: Implement guide resource handler
 * T067: Calculate data freshness (hours since last sync)
 * 
 * @param db Database instance
 * @returns Guide resource data
 */
export function generateGuideResource(db: Database.Database): GuideResourceData {
    const startTime = Date.now();

    logger.debug('Generating guide resource');

    // T065: Extract metadata from database
    const tags = getAllTags(db);
    const categories = getAllCategories(db);
    const products = getAllProducts(db);
    const statuses = getAllStatuses(db);
    const availabilityRings = getAllAvailabilityRings(db);
    const totalRecords = getUpdateCount(db);

    // T067: Calculate data freshness
    const checkpoint = getSyncCheckpoint(db);
    const lastSync = checkpoint?.lastSync || 'Never';
    const syncStatus = checkpoint?.syncStatus || 'unknown';

    let hoursSinceSync = 0;
    if (checkpoint && checkpoint.lastSync !== '1970-01-01T00:00:00.0000000Z') {
        const lastSyncTime = new Date(checkpoint.lastSync).getTime();
        const now = Date.now();
        hoursSinceSync = Math.round((now - lastSyncTime) / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
    }

    const duration = Date.now() - startTime;

    logger.info('Guide resource generated', {
        tagCount: tags.length,
        categoryCount: categories.length,
        productCount: products.length,
        totalRecords,
        hoursSinceSync,
        durationMs: duration,
    });

    // Get retention start date from environment
    const retentionStartDate = process.env.DATA_RETENTION_START_DATE || null;

    return {
        overview: `Azure Updates MCP Server provides natural language search for Azure service updates, retirements, and feature announcements. Search across ${totalRecords.toLocaleString()} updates without learning OData syntax.`,

        dataAvailability: {
            retentionStartDate,
            note: retentionStartDate
                ? `Updates are retained from ${retentionStartDate} onwards. Older updates are automatically filtered during sync to save storage space.`
                : 'All historical updates are retained without date filtering.',
        },

        availableFilters: {
            tags,
            productCategories: categories,
            products,
            statuses,
            availabilityRings,
        },

        usageExamples: [
            {
                description: 'Natural language search with tag filter',
                query: {
                    query: 'OAuth authentication security',
                    filters: {
                        tags: ['Security'],
                    },
                    limit: 10,
                },
            },
            {
                description: 'Find retirements in Q1 2026 for Compute services',
                query: {
                    filters: {
                        tags: ['Retirements'],
                        productCategories: ['Compute'],
                        dateFrom: '2026-01-01',
                        dateTo: '2026-03-31',
                    },
                },
            },
            {
                description: 'Search for machine learning preview features',
                query: {
                    query: 'machine learning',
                    filters: {
                        availabilityRing: 'Preview',
                        productCategories: ['AI + machine learning'],
                    },
                },
            },
            {
                description: 'Get specific update by ID',
                query: {
                    id: 'AZ-123e4567-e89b-12d3-a456-426614174000',
                },
            },
        ],

        dataFreshness: {
            lastSync,
            hoursSinceSync,
            totalRecords,
            syncStatus,
        },

        queryTips: [
            'Use natural language queries like "show me security updates" or "find database retirements"',
            'Combine keyword search with filters for precise results',
            'Use dateFrom/dateTo for time range filtering (ISO 8601 format: YYYY-MM-DD)',
            'Multiple values in array filters use OR logic within the same filter type',
            'Different filter types are combined with AND logic',
            'Set limit (max 100) and offset for pagination through large result sets',
            'Relevance scores are returned for keyword searches to help identify best matches',
        ],
    };
}

/**
 * Format guide resource as MCP resource response
 * 
 * @param db Database instance
 * @returns MCP resource response
 */
export function getGuideResourceResponse(
    db: Database.Database
): { contents: Array<{ uri: string; mimeType: string; text: string }> } {
    const guideData = generateGuideResource(db);

    return {
        contents: [
            {
                uri: 'azure-updates://guide',
                mimeType: 'application/json',
                text: JSON.stringify(guideData, null, 2),
            },
        ],
    };
}
