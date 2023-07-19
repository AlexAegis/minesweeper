// managed-by-autotool

import { defineAppConfig } from '@alexaegis/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineAppConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
