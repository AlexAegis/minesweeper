// managed-by-autotool

import { DEFAULT_VITE_LIB_CONFIG } from '@alexaegis/vite';
import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default mergeConfig(
	DEFAULT_VITE_LIB_CONFIG,
	defineConfig({
		plugins: [
			...(process.env['BUILD_REASON'] === 'publish' ? [dts({ entryRoot: 'src' })] : []),
		],
	}),
);
