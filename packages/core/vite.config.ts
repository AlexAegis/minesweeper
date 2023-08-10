// managed-by-autotool

import { pakk } from '@alexaegis/vite';
import { defineConfig } from 'vite';

// default config for node libraries
export default defineConfig({
	plugins: [
		pakk({
			dts: process.env['BUILD_REASON'] === 'publish',
		}),
	],
});
