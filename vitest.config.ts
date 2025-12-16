import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        silent: true,
        reporters: process.env.CI ? ['verbose'] : ['default'],
        logHeapUsage: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                'tests/',
                '**/*.config.ts',
                '**/*.d.ts'
            ]
        },
        include: ['tests/**/*.test.ts'],
        testTimeout: 10000
    }
});
