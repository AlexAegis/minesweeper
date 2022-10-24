import { asyncScheduler, fromEvent, scheduled, tap } from 'rxjs';
import packageJson from '../../../package.json';

import { Scope, TinySlicePlugin } from '@tinyslice/core';

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

//const plugins: TinySlicePlugin<RootState>[] = [
//	new TinySliceHydrationPlugin<RootState>(PACKAGE_NAME_AND_VERSION),
//];
const plugins: TinySlicePlugin<RootState>[] = [];

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
