import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/utils/**/*.js', 'src/password/**/*.js'],
      exclude: ['src/**/*.test.js'],
    },
  },
});
