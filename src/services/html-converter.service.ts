/**
 * HTML-to-Markdown conversion service for Azure Updates descriptions
 * 
 * Converts HTML content from Azure Updates API to clean markdown format
 * optimized for LLM consumption, preserving all content including data URLs.
 */

import TurndownService from 'turndown';
import * as logger from '../utils/logger.js';

// Type for Turndown node (simplified)
interface TurndownElement {
    getAttribute(name: string): string | null;
}

/**
 * Turndown instance with custom configuration
 * Configured once and reused for all conversions
 */
let turndownService: TurndownService | null = null;

/**
 * Initialize the Turndown service with custom rules
 */
function initializeTurndown(): TurndownService {
    if (turndownService) {
        return turndownService;
    }

    const service = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-',
        emDelimiter: '*',
        strongDelimiter: '**',
        linkStyle: 'inlined',
        linkReferenceStyle: 'full',
    });

    // Custom rule to preserve data URLs in images
    service.addRule('preserveDataUrls', {
        filter: ['img'],
        replacement: (_content, node) => {
            const element = node as TurndownElement;
            const src = element.getAttribute('src') || '';
            const alt = element.getAttribute('alt') || '';
            const title = element.getAttribute('title');

            return formatImageMarkdown(src, alt, title);
        },
    });

    // Custom rule to preserve line breaks
    service.addRule('lineBreaks', {
        filter: ['br'],
        replacement: () => '  \n',
    });

    // Custom rule for better handling of links
    service.addRule('links', {
        filter: ['a'],
        replacement: (content, node) => {
            const element = node as TurndownElement;
            const href = element.getAttribute('href');
            const title = element.getAttribute('title');

            if (!href) {
                return content;
            }

            const processedUrl = normalizeUrl(href);
            return formatLinkMarkdown(content, processedUrl, title);
        },
    });

    // Custom rule to handle tables
    service.addRule('tables', {
        filter: ['table'],
        replacement: (content) => {
            // Turndown handles tables by default, but we ensure proper spacing
            return '\n\n' + content + '\n\n';
        },
    });

    turndownService = service;
    return service;
}

/**
 * Format image markdown with optional title
 * 
 * @param src Image source URL
 * @param alt Alt text
 * @param title Optional title attribute
 * @returns Formatted markdown image string
 */
function formatImageMarkdown(src: string, alt: string, title: string | null): string {
    if (!src) {
        return '';
    }

    const titlePart = title ? ` "${title}"` : '';
    return `![${alt}](${src}${titlePart})`;
}

/**
 * Normalize URL by converting relative paths to absolute
 * 
 * @param href Original URL
 * @returns Normalized URL
 */
function normalizeUrl(href: string): string {
    // Preserve special protocols as-is
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        return href;
    }

    // Convert relative URLs to absolute
    if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
        return `https://azure.microsoft.com${href.startsWith('/') ? href : '/' + href}`;
    }

    return href;
}

/**
 * Format link markdown with optional title
 * 
 * @param content Link text content
 * @param url Link URL
 * @param title Optional title attribute
 * @returns Formatted markdown link string
 */
function formatLinkMarkdown(content: string, url: string, title: string | null): string {
    const titlePart = title ? ` "${title}"` : '';
    return `[${content}](${url}${titlePart})`;
}

/**
 * Convert HTML content to markdown
 * 
 * @param html HTML content to convert
 * @returns Markdown string, or null if input is null/empty
 */
export function convertHtmlToMarkdown(html: string | null | undefined): string | null {
    if (!html || html.trim() === '') {
        return null;
    }

    try {
        const service = initializeTurndown();
        const markdown = service.turndown(html);

        // Clean up excessive whitespace while preserving intentional line breaks
        const cleaned = markdown
            .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
            .replace(/[ \t]+$/gm, '') // Remove trailing spaces
            .trim();

        logger.debug('HTML converted to markdown', {
            inputLength: html.length,
            outputLength: cleaned.length,
        });

        return cleaned;
    } catch (error) {
        logger.errorWithStack('Failed to convert HTML to markdown', error as Error, {
            htmlLength: html.length,
        });

        // Fallback: return plain text by stripping all HTML tags
        return stripHtmlTags(html);
    }
}

/**
 * Strip all HTML tags from content (fallback for malformed HTML)
 * 
 * @param html HTML content
 * @returns Plain text content
 */
function stripHtmlTags(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .replace(/<[^>]+>/g, '') // Remove all tags
        .replace(/&nbsp;/g, ' ') // Convert HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

/**
 * Batch convert multiple HTML strings to markdown
 * 
 * @param htmlArray Array of HTML strings
 * @returns Array of markdown strings (null for null inputs)
 */
export function convertBatch(htmlArray: Array<string | null | undefined>): Array<string | null> {
    return htmlArray.map(html => convertHtmlToMarkdown(html));
}

/**
 * Get conversion statistics for monitoring
 * 
 * @returns Service statistics
 */
export function getConversionStats(): {
    initialized: boolean;
} {
    return {
        initialized: turndownService !== null,
    };
}
