import { describe, it, expect, beforeAll } from 'vitest';
import { VERSION } from '../src/placeholder.js';
import { configureLogger } from '../src/utils/logger.js';

beforeAll(() => {
    // テスト実行時はログ出力を抑制
    configureLogger({
        level: 'error',
        enableConsole: false,
    });
});

describe('Setup Validation', () => {
    it('should have correct version', () => {
        expect(VERSION).toBe('0.1.0');
    });
});
