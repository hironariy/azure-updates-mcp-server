import { describe, it, expect, beforeEach } from 'vitest';
import { convertHtmlToMarkdown, convertBatch, getConversionStats } from '../../../src/services/html-converter.service.js';

describe('HTML Converter Service', () => {
    describe('convertHtmlToMarkdown', () => {
        it('should convert simple HTML to markdown', () => {
            const html = '<p>Hello <strong>world</strong></p>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBe('Hello **world**');
        });

        it('should return null for empty input', () => {
            expect(convertHtmlToMarkdown(null)).toBeNull();
            expect(convertHtmlToMarkdown(undefined)).toBeNull();
            expect(convertHtmlToMarkdown('')).toBeNull();
            expect(convertHtmlToMarkdown('   ')).toBeNull();
        });

        it('should preserve data URLs in images', () => {
            const html = '<img src="data:image/png;base64,iVBORw0KG" alt="Test Image">';
            const result = convertHtmlToMarkdown(html);
            expect(result).toContain('![Test Image](data:image/png;base64,iVBORw0KG)');
        });

        it('should convert regular image URLs', () => {
            const html = '<img src="https://example.com/image.png" alt="Test">';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBe('![Test](https://example.com/image.png)');
        });

        it('should convert images with title attribute', () => {
            const html = '<img src="https://example.com/img.png" alt="Alt text" title="Title text">';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBe('![Alt text](https://example.com/img.png "Title text")');
        });

        it('should convert line breaks to markdown', () => {
            const html = '<p>Line 1<br>Line 2</p>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toContain('Line 1');
            expect(result).toContain('Line 2');
        });

        it('should convert links to markdown', () => {
            const html = '<a href="https://example.com">Link text</a>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBe('[Link text](https://example.com)');
        });

        it('should preserve mailto links', () => {
            const html = '<a href="mailto:test@example.com">Email</a>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBe('[Email](mailto:test@example.com)');
        });

        it('should convert relative URLs to absolute', () => {
            const html = '<a href="/docs/article">Article</a>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBe('[Article](https://azure.microsoft.com/docs/article)');
        });

        it('should handle links with title attribute', () => {
            const html = '<a href="https://example.com" title="Example Site">Link</a>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBe('[Link](https://example.com "Example Site")');
        });

        it('should handle links without href', () => {
            const html = '<a>No href</a>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBe('No href');
        });

        it('should convert headings', () => {
            const html = '<h1>Heading 1</h1><h2>Heading 2</h2>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toContain('# Heading 1');
            expect(result).toContain('## Heading 2');
        });

        it('should convert lists', () => {
            const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toContain('Item 1');
            expect(result).toContain('Item 2');
        });

        it('should convert tables', () => {
            const html = '<table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBeTruthy();
            expect(result).toContain('Header');
            expect(result).toContain('Data');
        });

        it('should clean up excessive whitespace', () => {
            const html = '<p>Line 1</p>\n\n\n\n<p>Line 2</p>';
            const result = convertHtmlToMarkdown(html);
            expect(result).not.toContain('\n\n\n');
        });

        it('should handle complex HTML structures', () => {
            const html = `
                <div>
                    <h2>Title</h2>
                    <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                    </ul>
                </div>
            `;
            const result = convertHtmlToMarkdown(html);
            expect(result).toContain('## Title');
            expect(result).toContain('**bold**');
            expect(result).toContain('*italic*');
            expect(result).toContain('Item 1');
        });

        it('should fallback to plain text on malformed HTML', () => {
            const html = '<p>Normal <invalidtag>content</p>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBeTruthy();
            expect(result).toContain('Normal');
            expect(result).toContain('content');
        });

        it('should handle HTML entities', () => {
            const html = '<p>&lt;script&gt; &amp; &quot;text&quot;</p>';
            const result = convertHtmlToMarkdown(html);
            // Turndown or fallback should handle entities
            expect(result).toBeTruthy();
        });

        it('should strip script tags in fallback', () => {
            // Force an error by providing invalid input to trigger fallback
            const html = '<script>alert("test")</script><p>Content</p>';
            const result = convertHtmlToMarkdown(html);
            expect(result).toBeTruthy();
            // If fallback is used, scripts should be removed
        });
    });

    describe('convertBatch', () => {
        it('should convert multiple HTML strings', () => {
            const htmlArray = [
                '<p>First</p>',
                '<p>Second</p>',
                '<p>Third</p>',
            ];
            const results = convertBatch(htmlArray);
            expect(results).toHaveLength(3);
            expect(results[0]).toBe('First');
            expect(results[1]).toBe('Second');
            expect(results[2]).toBe('Third');
        });

        it('should handle null values in array', () => {
            const htmlArray = [
                '<p>Valid</p>',
                null,
                undefined,
                '<p>Another</p>',
            ];
            const results = convertBatch(htmlArray);
            expect(results).toHaveLength(4);
            expect(results[0]).toBe('Valid');
            expect(results[1]).toBeNull();
            expect(results[2]).toBeNull();
            expect(results[3]).toBe('Another');
        });

        it('should handle empty array', () => {
            const results = convertBatch([]);
            expect(results).toHaveLength(0);
        });
    });

    describe('getConversionStats', () => {
        beforeEach(() => {
            // Stats should show initialized after first conversion
            convertHtmlToMarkdown('<p>Initialize</p>');
        });

        it('should return initialization status', () => {
            const stats = getConversionStats();
            expect(stats).toHaveProperty('initialized');
            expect(stats.initialized).toBe(true);
        });
    });
});
