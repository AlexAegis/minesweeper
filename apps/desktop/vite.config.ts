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
	},
	{
		plugins: [tailwindcss(), sveltekit()],
		css: {
			// rolldown-vite minifies css with lightningcss, which hard-errors on
			// invalid css shipped by third-party dependencies. Apps bundle vendor css they
			// do not control; report it as a warning instead of failing the build.
			lightningcss: {
				errorRecovery: true,
			},
		},
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
