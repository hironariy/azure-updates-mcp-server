import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as logger from '../../../src/utils/logger.js';

describe('Logger Utility', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Create fresh spies for each test
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Reset logger config
        logger.configureLogger({ level: 'info', enableConsole: true });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('configureLogger', () => {
        it('should configure log level', () => {
            logger.configureLogger({ level: 'debug' });
            expect(logger.getLogLevel()).toBe('debug');
        });

        it('should configure console output', () => {
            logger.configureLogger({ enableConsole: false });
            logger.info('test message');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    describe('log level filtering', () => {
        it('should not log debug when level is info', () => {
            logger.configureLogger({ level: 'info' });
            logger.debug('debug message');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should log info when level is info', () => {
            logger.configureLogger({ level: 'info' });
            logger.info('info message');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should log warn when level is info', () => {
            logger.configureLogger({ level: 'info' });
            logger.warn('warn message');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should log error when level is info', () => {
            logger.configureLogger({ level: 'info' });
            logger.error('error message');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should not log info when level is error', () => {
            logger.configureLogger({ level: 'error' });
            logger.info('info message');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    describe('log formatting', () => {
        it('should format logs as JSON', () => {
            logger.info('test message');
            expect(consoleErrorSpy).toHaveBeenCalled();
            const logOutput = consoleErrorSpy.mock.calls[0][0] as string;
            expect(() => JSON.parse(logOutput)).not.toThrow();
        });

        it('should include timestamp', () => {
            logger.info('test message');
            const logOutput = consoleErrorSpy.mock.calls[0][0] as string;
            const parsed = JSON.parse(logOutput);
            expect(parsed).toHaveProperty('timestamp');
            expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });

        it('should include log level', () => {
            logger.warn('test warning');
            const logOutput = consoleErrorSpy.mock.calls[0][0] as string;
            const parsed = JSON.parse(logOutput);
            expect(parsed.level).toBe('warn');
        });

        it('should include message', () => {
            logger.info('test message');
            const logOutput = consoleErrorSpy.mock.calls[0][0] as string;
            const parsed = JSON.parse(logOutput);
            expect(parsed.message).toBe('test message');
        });

        it('should include context', () => {
            logger.info('test', { userId: 123, action: 'login' });
            const logOutput = consoleErrorSpy.mock.calls[0][0] as string;
            const parsed = JSON.parse(logOutput);
            expect(parsed.userId).toBe(123);
            expect(parsed.action).toBe('login');
        });
    });

    describe('errorWithStack', () => {
        it('should log error with stack trace', () => {
            const testError = new Error('test error');
            logger.errorWithStack('Error occurred', testError);

            expect(consoleErrorSpy).toHaveBeenCalled();
            const logOutput = consoleErrorSpy.mock.calls[0][0] as string;
            const parsed = JSON.parse(logOutput);

            expect(parsed.message).toBe('Error occurred');
            expect(parsed.error).toBe('test error');
            expect(parsed.stack).toBeDefined();
        });

        it('should include additional context', () => {
            const testError = new Error('test error');
            logger.errorWithStack('Error occurred', testError, { requestId: 'abc123' });

            const logOutput = consoleErrorSpy.mock.calls[0][0] as string;
            const parsed = JSON.parse(logOutput);

            expect(parsed.requestId).toBe('abc123');
        });
    });

    describe('edge cases', () => {
        it('should handle undefined context', () => {
            expect(() => logger.info('test', undefined)).not.toThrow();
        });

        it('should handle empty context', () => {
            expect(() => logger.info('test', {})).not.toThrow();
        });

        it('should handle complex context objects', () => {
            const complexContext = {
                nested: { value: 123 },
                array: [1, 2, 3],
                nullValue: null,
            };

            expect(() => logger.info('test', complexContext)).not.toThrow();
        });
    });
});
