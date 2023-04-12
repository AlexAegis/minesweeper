import { asyncScheduler, fromEvent, mergeMap, of, scheduled } from 'rxjs';
import packageJson from '../../../package.json';

import { Scope, type TinySlicePlugin } from '@tinyslice/core';

import { TinySliceHydrationPlugin } from '@tinyslice/hydration-plugin';

export const MS_TAG = '[minesweeper]';
export const BROWSER_TAG = '[browser]';

export const scope = new Scope();

export const packageMetadata = packageJson;

export interface RootState {
	debug: boolean;
}

export const PACKAGE_NAME_AND_VERSION = `${packageMetadata.displayName} (${packageMetadata.version})`;

export const documentPointerdown$ = scheduled(
	fromEvent<PointerEvent>(document, 'pointerdown'),
	asyncScheduler
);

export const documentPointerup$ = scheduled(
	fromEvent<PointerEvent>(document, 'pointerup'),
	asyncScheduler
);

const plugins: TinySlicePlugin<RootState>[] = [
	new TinySliceHydrationPlugin<RootState>(PACKAGE_NAME_AND_VERSION),
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
		mergeMap((debug) => {
			if (debug) {
				return rootSlice$.loadAndSetPlugins(
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
				return of();
			}
		})
	)
);
