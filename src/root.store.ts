import { tap } from 'rxjs';
import packageJson from '../package.json';

import { Scope } from '@tinyslice/core';

export const MS_TAG = '[minesweeper]';
export const BROWSER_TAG = '[browser]';

export const scope = new Scope();

export const packageMetadata = packageJson;

export interface RootState {
	debug: boolean;
}

export const PACKAGE_NAME_AND_VERSION = `${packageMetadata.displayName} (${packageMetadata.version})`;

const plugins = [
	/*new TinySliceHydrationPlugin<RootState>(PACKAGE_NAME_AND_VERSION)*/
];

export const rootSlice$ = scope.createRootSlice(
	{
		debug: true,
	} as RootState,
	{
		plugins,
	}
);

export const debug$ = rootSlice$.slice('debug');

scope.createEffect(
	debug$.pipe(
		tap((debug) => {
			if (debug) {
				rootSlice$.loadAndSetPlugins(
					() =>
						import('@tinyslice/devtools-plugin').then(
							(plugin) =>
								new plugin.TinySliceDevtoolPlugin({
									name: PACKAGE_NAME_AND_VERSION,
								})
						),
					() =>
						import('@tinyslice/logger-plugin').then(
							(plugin) =>
								new plugin.TinySliceLoggerPlugin({
									onlyTimers: true,
									disableGrouping: false,
									ignoreActions: [/.*timer.*/, /.*move.*/, /.*resize.*/],
								})
						)
				);
			} else {
				rootSlice$.setPlugins(plugins);
			}
		})
	)
);