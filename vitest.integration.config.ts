import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run integration tests
    include: ['tests/integration/**/*.test.ts'],
    
    // Longer timeouts for integration tests
    testTimeout: 600000, // 10 minutes
    hookTimeout: 60000,  // 1 minute for setup/teardown
    
    // Run tests sequentially to avoid API rate limits
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    
    // Environment variables
    env: {
      NODE_ENV: 'test',
    },
    
    // Global setup and teardown
    // globalSetup: ['tests/integration/global-setup.ts'],
    
    // Reporter configuration
    reporter: ['verbose'],
    
    // Coverage (optional)
    coverage: {
      enabled: false, // Disable for integration tests
    },
    
    // Retry failed tests once
    retry: 1,
    
    // Bail on first failure for faster feedback
    bail: 1,
  },
});
