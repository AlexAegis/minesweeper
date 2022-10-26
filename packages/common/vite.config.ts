import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: 'src/index.ts',
			fileName: 'index',
			formats: ['cjs', 'es'],
		},
	},
	plugins: [
		dts({
			insertTypesEntry: true,
			tsConfigFilePath: 'tsconfig.lib.json',
			entryRoot: 'src',
		}),
		viteStaticCopy({
			targets: [
				{
					src: 'package.json',
					dest: '.',
					transform: (packageJson) => {
						return packageJson.replace(/"main": ".*"/, '"main": "index.js"');
					},
				},
				{
					src: '*.md',
					dest: '.',
				},
			],
		}),
	],
});
