// managed-by-autotool
import { DEFAULT_VITE_APP_CONFIG } from '@alexaegis/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { mergeConfig } from 'vite';

export default mergeConfig(DEFAULT_VITE_APP_CONFIG, {
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	server: {
		fs: {
			allow: ['../..'],
		},
	},
});
