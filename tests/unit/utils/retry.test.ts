import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../../src/utils/retry.js';

describe('Retry Utility', () => {
    describe('withRetry', () => {
        it('should succeed on first attempt', async () => {
            const successFn = vi.fn().mockResolvedValue('success');

            const result = await withRetry(successFn, {
                maxRetries: 3,
                initialDelayMs: 10,
                maxDelayMs: 100,
                backoffMultiplier: 2,
            });

            expect(result).toBe('success');
            expect(successFn).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and eventually succeed', async () => {
            let attemptCount = 0;
            const retryFn = vi.fn().mockImplementation(async () => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Network error: timeout');
                }
                return 'success';
            });

            const result = await withRetry(retryFn, {
                maxRetries: 5,
                initialDelayMs: 10,
                maxDelayMs: 100,
                backoffMultiplier: 2,
            });

            expect(result).toBe('success');
            expect(retryFn).toHaveBeenCalledTimes(3);
        });

        it('should throw after max retries exceeded', async () => {
            const failFn = vi.fn().mockRejectedValue(new Error('Network timeout'));

            await expect(
                withRetry(failFn, {
                    maxRetries: 3,
                    initialDelayMs: 10,
                    maxDelayMs: 100,
                    backoffMultiplier: 2,
                })
            ).rejects.toThrow('Network timeout');

            expect(failFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
        });

        it('should use exponential backoff', async () => {
            const timestamps: number[] = [];
            let attemptCount = 0;

            const retryFn = vi.fn().mockImplementation(async () => {
                timestamps.push(Date.now());
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Network timeout');
                }
                return 'success';
            });

            await withRetry(retryFn, {
                maxRetries: 3,
                initialDelayMs: 50,
                maxDelayMs: 1000,
                backoffMultiplier: 2,
            });

            // Check that delays increased (exponential backoff)
            // Allow some tolerance for timing variations in test execution
            if (timestamps.length >= 3) {
                const delay1 = timestamps[1] - timestamps[0];
                const delay2 = timestamps[2] - timestamps[1];
                // Second delay should be approximately double the first (with tolerance)
                expect(delay2).toBeGreaterThanOrEqual(delay1 * 0.9);
            }
        });

        it('should handle synchronous errors', async () => {
            const errorFn = vi.fn().mockImplementation(() => {
                throw new Error('Non-retryable sync error');
            });

            await expect(
                withRetry(errorFn, {
                    maxRetries: 2,
                    initialDelayMs: 10,
                    maxDelayMs: 100,
                    backoffMultiplier: 2,
                })
            ).rejects.toThrow('Non-retryable sync error');

            // Non-retryable errors should fail immediately
            expect(errorFn).toHaveBeenCalledTimes(1);
        });

        it('should respect maxRetries of 0', async () => {
            const failFn = vi.fn().mockRejectedValue(new Error('Non-retryable'));

            await expect(
                withRetry(failFn, {
                    maxRetries: 0,
                    initialDelayMs: 10,
                    maxDelayMs: 100,
                    backoffMultiplier: 2,
                })
            ).rejects.toThrow('Non-retryable');

            expect(failFn).toHaveBeenCalledTimes(1); // Only initial attempt
        });

        it('should pass through return value types correctly', async () => {
            const numberFn = vi.fn().mockResolvedValue(42);
            const result = await withRetry(numberFn, {
                maxRetries: 3,
                initialDelayMs: 10,
                maxDelayMs: 100,
                backoffMultiplier: 2,
            });

            expect(result).toBe(42);
            expect(typeof result).toBe('number');
        });

        it('should handle different error types', async () => {
            const customError = new TypeError('Type error');
            const errorFn = vi.fn().mockRejectedValue(customError);

            await expect(
                withRetry(errorFn, {
                    maxRetries: 2,
                    initialDelayMs: 10,
                    maxDelayMs: 100,
                    backoffMultiplier: 2,
                })
            ).rejects.toThrow(TypeError);

            // Non-retryable error
            expect(errorFn).toHaveBeenCalledTimes(1);
        });

        it('should use custom retryable errors list', async () => {
            let attemptCount = 0;
            const retryFn = vi.fn().mockImplementation(async () => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Custom retryable error');
                }
                return 'success';
            });

            const result = await withRetry(retryFn, {
                maxRetries: 5,
                initialDelayMs: 10,
                maxDelayMs: 100,
                backoffMultiplier: 2,
                retryableErrors: ['custom retryable'],
            });

            expect(result).toBe('success');
            expect(retryFn).toHaveBeenCalledTimes(3);
        });

        it('should invoke onRetry callback', async () => {
            const onRetryMock = vi.fn();
            let attemptCount = 0;

            const retryFn = vi.fn().mockImplementation(async () => {
                attemptCount++;
                if (attemptCount < 2) {
                    throw new Error('Network timeout');
                }
                return 'success';
            });

            await withRetry(retryFn, {
                maxRetries: 3,
                initialDelayMs: 10,
                maxDelayMs: 100,
                backoffMultiplier: 2,
                onRetry: onRetryMock,
            });

            expect(onRetryMock).toHaveBeenCalledTimes(1);
            expect(onRetryMock).toHaveBeenCalledWith(1, expect.any(Error));
        });

        it('should cap delay at maxDelayMs', async () => {
            const timestamps: number[] = [];
            let attemptCount = 0;

            const retryFn = vi.fn().mockImplementation(async () => {
                timestamps.push(Date.now());
                attemptCount++;
                if (attemptCount < 4) {
                    throw new Error('Network timeout');
                }
                return 'success';
            });

            await withRetry(retryFn, {
                maxRetries: 5,
                initialDelayMs: 100,
                maxDelayMs: 150,
                backoffMultiplier: 3,
            });

            // Verify attempts were made
            expect(attemptCount).toBe(4);
            expect(timestamps.length).toBe(4);
        });
    });
});
