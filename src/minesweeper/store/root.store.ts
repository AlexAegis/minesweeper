import { tap } from 'rxjs';
import packageJson from '../../../package.json';
import { scope } from './scope';

import { TinySliceHydrationPlugin } from '@tinyslice/hydration-plugin';
export interface RootState {
	debug: boolean;
}

export const PACKAGE_NAME_AND_VERSION = `${packageJson.displayName} (${packageJson.version})`;

const plugins = [new TinySliceHydrationPlugin<RootState>('rootState')];

export const rootSlice$ = scope.createRootSlice(
	{
		debug: false,
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
				rootSlice$.loadAndAddPlugins(
					() =>
						import('@tinyslice/devtools-plugin').then(
							(plugin) =>
								new plugin.TinySliceDevtoolPlugin<RootState>({
									name: PACKAGE_NAME_AND_VERSION,
								})
						),
					() =>
						import('@tinyslice/logger-plugin').then(
							(plugin) => new plugin.TinySliceLoggerPlugin<RootState>()
						)
				);
			} else {
				rootSlice$.setPlugins(plugins);
			}
		})
	)
);
