import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: 'src/index.ts',
			fileName: 'index',
			formats: ['cjs', 'es'],
		},
	},
	plugins: [
		dts({
			insertTypesEntry: true,
		}),
		viteStaticCopy({
			targets: [
				{
					src: 'package.json',
					dest: '.',
				},
			],
		}),
	],
});
