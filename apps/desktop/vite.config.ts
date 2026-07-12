// managed-by-autotool
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

export default mergeConfig(
	{
		build: {
			// Keep in sync with @alexaegis/vite DEFAULT_BUILD_TARGET.
			// This is intentionally inlined so `svelte-kit sync` works during clean install
			// before @alexaegis/vite dist files are built.
			target: 'es2022',
		},
		css: {
			// 98.css@0.1.21 ships a malformed `@media (not(hover))` query. SvelteKit
			// drives CSS minification through lightningcss (ignoring build.cssMinify),
			// which hard-errors on it. errorRecovery downgrades that parse error to a
			// warning so the build completes; drop this once 98.css fixes the query.
			lightningcss: {
				errorRecovery: true,
			},
		},
	},
	{
		plugins: [tailwindcss(), sveltekit()],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}'],
		},
		server: {
			fs: {
				allow: ['../..'],
			},
		},
	},
);
