import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			provider: 'c8',
			reporter: ['text', 'json', 'html', 'lcov'],
		},
	},
});
