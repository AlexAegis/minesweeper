import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

// ? The svelte plugin should only be present on svelte apps but the test
// ? runner doesn't support picking up inner configs
// ? https://github.com/vitest-dev/vscode/issues/13
export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			provider: 'c8',
			reporter: ['text', 'json', 'html', 'lcov'],
		},
	},
});
