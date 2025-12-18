/**
 * TypeScript interfaces for search query parsing and validation
 * 
 * Used by the search_azure_updates MCP tool
 */

/**
 * Sort options for search results
 */
export type SortBy =
    | 'relevance' // BM25 relevance score (keyword queries only)
    | 'modified:desc' // Most recently modified first
    | 'modified:asc' // Oldest modified first
    | 'created:desc' // Most recently created first
    | 'created:asc' // Oldest created first
    | 'retirement:asc' // Earliest retirement first
    | 'retirement:desc'; // Latest retirement first

/**
 * Search filters for Azure updates
 * 
 * NOTE on retirement date filters (retirementFrom/To):
 * The Azure API provides retirement dates at YYYY-MM granularity (month precision only).
 * Dates are stored in the database normalized to the 1st of the month (e.g., "2026-06" → "2026-06-01").
 * When filtering, any ISO 8601 date within the target month works correctly due to date comparison logic.
 */
export interface SearchFilters {
    status?: string; // Filter by status (e.g., 'Active', 'Retired')
    availabilityRing?: string; // Filter by availability ring
    modifiedFrom?: string; // ISO 8601 date - include updates modified on or after this date
    modifiedTo?: string; // ISO 8601 date - include updates modified on or before this date
    retirementFrom?: string; // ISO 8601 date - include updates with retirement on or after this date (month-level granularity)
    retirementTo?: string; // ISO 8601 date - include updates with retirement on or before this date (month-level granularity)
    tags?: string[]; // Filter by tags - result must contain ALL specified tags (AND semantics)
    products?: string[]; // Filter by products - result must contain ALL specified products (AND semantics)
    productCategories?: string[]; // Filter by product categories - result must contain ALL specified categories (AND semantics)
}

/**
 * Search query parameters
 */
export interface SearchQuery {
    query?: string; // Natural language search query - searches across title, description, tags, productCategories, products
    filters?: SearchFilters; // Structured filters (AND logic)
    sortBy?: SortBy; // Sort order with direction suffix
    limit?: number; // Max results to return (default: 20, max: 100)
    offset?: number; // Number of results to skip for pagination (default: 0)
}

/**
 * Search result metadata
 */
export interface SearchMetadata {
    totalResults: number; // Total matching results (before limit/offset)
    returnedResults: number; // Number of results in this response
    limit: number; // Applied limit
    offset: number; // Applied offset
    hasMore: boolean; // True if more results available
    queryTime: number; // Query execution time in milliseconds
}

/**
 * Complete search response
 */
export interface SearchResponse<T = unknown> {
    results: T[]; // Array of matching results
    metadata: SearchMetadata; // Query metadata
}

/**
 * Validation error
 */
export interface ValidationError {
    field: string; // Field name that failed validation
    message: string; // Human-readable error message
    value?: unknown; // The invalid value
}

/**
 * Query validation result
 */
export interface QueryValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

/**
 * Available filter options (metadata)
 */
export interface FilterOptions {
    tags: string[];
    productCategories: string[];
    products: string[];
    availabilityRings: string[];
    statuses: string[];
}
