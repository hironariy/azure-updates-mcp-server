/**
 * Search service for Azure Updates with FTS5 full-text search
 * 
 * Provides keyword search across title and description fields with BM25 relevance ranking,
 * multi-dimensional filtering (tags, categories, products), and pagination support.
 */

import type Database from 'better-sqlite3';
import type {
    AzureUpdateSearchResult,
} from '../models/azure-update.js';
import type {
    SearchQuery,
    SearchFilters,
    SearchResponse,
} from '../models/search-query.js';
import {
    getUpdateById,
    getTagsForUpdate,
    getCategoriesForUpdate,
    getProductsForUpdate,
    getAvailabilitiesForUpdate,
} from '../database/queries.js';
import * as logger from '../utils/logger.js';

// Constants for pagination limits
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * Handle get-by-ID query
 * 
 * @param db Database instance
 * @param id Update ID
 * @param startTime Query start time for metrics
 * @returns Search response with single result or empty
 */
function handleGetById(
    db: Database.Database,
    id: string,
    startTime: number
): SearchResponse<AzureUpdateSearchResult> {
    const update = getUpdateById(db, id);
    const queryTime = Date.now() - startTime;

    if (!update) {
        return createSearchResponse([], 0, 1, 0, queryTime);
    }

    return createSearchResponse([update], 1, 1, 0, queryTime);
}

/**
 * Create search response with metadata
 * 
 * @param results Search results
 * @param totalResults Total count of matching results
 * @param limit Results limit
 * @param offset Results offset
 * @param queryTime Query execution time in milliseconds
 * @returns Formatted search response
 */
function createSearchResponse<T>(
    results: T[],
    totalResults: number,
    limit: number,
    offset: number,
    queryTime: number
): SearchResponse<T> {
    return {
        results,
        metadata: {
            totalResults,
            returnedResults: results.length,
            limit,
            offset,
            hasMore: totalResults > offset + results.length,
            queryTime,
        },
    };
}

/**
 * Search Azure updates with keyword search and filters
 * 
 * @param db Database instance
 * @param query Search query parameters
 * @returns Search response with results and metadata
 */
export function searchUpdates(
    db: Database.Database,
    query: SearchQuery
): SearchResponse<AzureUpdateSearchResult> {
    const startTime = Date.now();

    // Handle get-by-ID case (overrides all other params)
    if (query.id) {
        return handleGetById(db, query.id, startTime);
    }

    // Build search query with enforced limits
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = query.offset ?? 0;

    const { sql, params } = buildSearchQuery(query.query, query.filters, limit, offset);

    logger.debug('Executing search query', {
        hasKeywordSearch: !!query.query,
        filters: query.filters,
        limit,
        offset,
    });

    // Execute search
    const stmt = db.prepare(sql);
    const results = stmt.all(...params) as Array<{
        id: string;
        title: string;
        description: string;
        descriptionMarkdown: string | null;
        status: string | null;
        locale: string | null;
        created: string;
        modified: string;
        relevance?: number;
    }>;

    // Get total count (without limit/offset)
    const { sql: countSql, params: countParams } = buildCountQuery(query.query, query.filters);
    const countStmt = db.prepare(countSql);
    const countResult = countStmt.get(...countParams) as { total: number };
    const totalResults = countResult.total;

    // Enrich results with related data
    const enrichedResults: AzureUpdateSearchResult[] = results.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        descriptionMarkdown: row.descriptionMarkdown ?? undefined,
        status: row.status,
        locale: row.locale,
        created: row.created,
        modified: row.modified,
        tags: getTagsForUpdate(db, row.id),
        productCategories: getCategoriesForUpdate(db, row.id),
        products: getProductsForUpdate(db, row.id),
        availabilities: getAvailabilitiesForUpdate(db, row.id),
        relevanceScore: row.relevance,
    }));

    const queryTime = Date.now() - startTime;

    return createSearchResponse(enrichedResults, totalResults, limit, offset, queryTime);
}

/**
 * Build FTS5 search query with filters
 * 
 * @param keyword Optional keyword search query
 * @param filters Optional structured filters
 * @param limit Result limit
 * @param offset Result offset
 * @returns SQL query and parameters
 */
function buildSearchQuery(
    keyword: string | undefined,
    filters: SearchFilters | undefined,
    limit: number,
    offset: number
): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const whereClauses: string[] = [];

    // FTS5 keyword search with BM25 relevance ranking
    if (keyword && keyword.trim() !== '') {
        const ftsQuery = sanitizeFtsQuery(keyword);

        // Join with FTS5 virtual table for keyword search
        const baseQuery = `
            SELECT 
                au.id,
                au.title,
                au.description_html as description,
                au.description_md as descriptionMarkdown,
                au.status,
                au.locale,
                au.created,
                au.modified,
                fts.rank as relevance
            FROM azure_updates au
            INNER JOIN updates_fts fts ON au.rowid = fts.rowid
            WHERE fts.updates_fts MATCH ?
        `;

        params.push(ftsQuery);

        // Apply filters
        const filterClauses = buildFilterClauses(filters, params);
        whereClauses.push(...filterClauses);

        const whereClause = whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '';

        const sql = `
            ${baseQuery}
            ${whereClause}
            ORDER BY fts.rank, au.modified DESC
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);

        return { sql, params };
    }

    // Filter-only query (no keyword search)
    const baseQuery = `
        SELECT 
            au.id,
            au.title,
            au.description_html as description,
            au.description_md as descriptionMarkdown,
            au.status,
            au.locale,
            au.created,
            au.modified
        FROM azure_updates au
    `;

    const filterClauses = buildFilterClauses(filters, params);

    const whereClause = filterClauses.length > 0 ? `WHERE ${filterClauses.join(' AND ')}` : '';

    const sql = `
        ${baseQuery}
        ${whereClause}
        ORDER BY au.modified DESC
        LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    return { sql, params };
}

/**
 * Build count query (same logic as search but COUNT(*))
 * 
 * @param keyword Optional keyword search query
 * @param filters Optional structured filters
 * @returns SQL query and parameters
 */
function buildCountQuery(
    keyword: string | undefined,
    filters: SearchFilters | undefined
): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const whereClauses: string[] = [];

    if (keyword && keyword.trim() !== '') {
        const ftsQuery = sanitizeFtsQuery(keyword);

        const baseQuery = `
            SELECT COUNT(*) as total
            FROM azure_updates au
            INNER JOIN updates_fts fts ON au.rowid = fts.rowid
            WHERE fts.updates_fts MATCH ?
        `;

        params.push(ftsQuery);

        const filterClauses = buildFilterClauses(filters, params);
        whereClauses.push(...filterClauses);

        const whereClause = whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '';

        return {
            sql: `${baseQuery} ${whereClause}`,
            params,
        };
    }

    // Filter-only count
    const baseQuery = `SELECT COUNT(*) as total FROM azure_updates au`;

    const filterClauses = buildFilterClauses(filters, params);
    const whereClause = filterClauses.length > 0 ? `WHERE ${filterClauses.join(' AND ')}` : '';

    return {
        sql: `${baseQuery} ${whereClause}`,
        params,
    };
}

/**
 * Build WHERE clauses for filters
 * 
 * @param filters Search filters
 * @param params Parameter array (mutated to add filter values)
 * @returns Array of WHERE clause strings
 */
function buildFilterClauses(
    filters: SearchFilters | undefined,
    params: unknown[]
): string[] {
    if (!filters) {
        return [];
    }

    const clauses: string[] = [];

    // Tags filter (T024)
    if (filters.tags && filters.tags.length > 0) {
        clauses.push(buildExistsClause('update_tags', 'ut', 'tag', filters.tags.length));
        params.push(...filters.tags);
    }

    // Product categories filter (T025)
    if (filters.productCategories && filters.productCategories.length > 0) {
        clauses.push(buildExistsClause('update_categories', 'uc', 'category', filters.productCategories.length));
        params.push(...filters.productCategories);
    }

    // Products filter (T026)
    if (filters.products && filters.products.length > 0) {
        clauses.push(buildExistsClause('update_products', 'up', 'product', filters.products.length));
        params.push(...filters.products);
    }

    // Status filter
    if (filters.status) {
        clauses.push('au.status = ?');
        params.push(filters.status);
    }

    // Availability ring filter
    if (filters.availabilityRing) {
        clauses.push(`EXISTS (
            SELECT 1 FROM update_availabilities ua 
            WHERE ua.update_id = au.id AND ua.ring = ?
        )`);
        params.push(filters.availabilityRing);
    }

    // Date range filters
    if (filters.dateFrom) {
        clauses.push('au.modified >= ?');
        params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
        clauses.push('au.modified <= ?');
        params.push(filters.dateTo);
    }

    return clauses;
}

/**
 * Build an EXISTS clause for array filters with OR logic
 * 
 * @param tableName Table name to query
 * @param tableAlias Table alias
 * @param columnName Column name to match
 * @param count Number of values to match
 * @returns SQL EXISTS clause string
 */
function buildExistsClause(
    tableName: string,
    tableAlias: string,
    columnName: string,
    count: number
): string {
    const conditions = Array(count)
        .fill(null)
        .map(() => `EXISTS (
                SELECT 1 FROM ${tableName} ${tableAlias} 
                WHERE ${tableAlias}.update_id = au.id AND ${tableAlias}.${columnName} = ?
            )`);
    return `(${conditions.join(' OR ')})`;
}

/**
 * Sanitize FTS5 query to prevent syntax errors
 * 
 * @param query User input query
 * @returns Sanitized FTS5 query string
 */
function sanitizeFtsQuery(query: string): string {
    // Remove special FTS5 characters that could cause syntax errors
    const sanitized = query
        .replace(/[(){}[\]^~*:]/g, ' ') // Remove FTS5 operators
        .replace(/[""]/g, '"') // Normalize quotes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

    // Split into words and join with OR for broad matching
    const words = sanitized
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => {
            // Escape remaining special characters
            const escaped = word.replace(/"/g, '""');
            return `"${escaped}"*`; // Prefix matching
        });

    return words.join(' OR ');
}
