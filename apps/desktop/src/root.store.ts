import { browser } from '$app/environment';
import { Scope, type TinySlicePlugin } from '@tinyslice/core';
import { TinySliceHydrationPlugin } from '@tinyslice/hydration-plugin';
import { Subject, asyncScheduler, fromEvent, mergeMap, of, scheduled, tap } from 'rxjs';
import packageJson from '../../../package.json';

export const MS_TAG = '[minesweeper]';
export const BROWSER_TAG = '[browser]';

export const scope = new Scope();

export const packageMetadata = packageJson;

export interface RootState {
	debug: boolean;
}

export const PACKAGE_NAME_AND_VERSION = `${packageMetadata.name} (${packageMetadata.version})`;

export const rootSlice$ = scope.createRootSlice({
	debug: true,
} as RootState);

export const debug$ = rootSlice$.slice('debug');

const documentPointerDownSubject$ = new Subject<PointerEvent>();
const documentPointerUpSubject$ = new Subject<PointerEvent>();
const documentMouseLeaveSubject$ = new Subject<PointerEvent>();

export const documentPointerDown$ = documentPointerDownSubject$.asObservable();
export const documentPointerUp$ = documentPointerUpSubject$.asObservable();
export const documentMouseLeave$ = documentMouseLeaveSubject$.asObservable();

if (browser) {
	scheduled(fromEvent<PointerEvent>(document, 'pointerdown'), asyncScheduler)
		.pipe(tap(documentPointerDownSubject$))
		.subscribe();

	scheduled(fromEvent<PointerEvent>(document, 'pointerup'), asyncScheduler)
		.pipe(tap(documentPointerUpSubject$))
		.subscribe();

	scheduled(fromEvent<PointerEvent>(document, 'mouseleave'), asyncScheduler)
		.pipe(tap(documentMouseLeaveSubject$))
		.subscribe();
}

if (browser) {
	const plugins: TinySlicePlugin<RootState>[] = [
		new TinySliceHydrationPlugin<RootState>(PACKAGE_NAME_AND_VERSION),
	];

	rootSlice$.setPlugins(plugins);

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
									}),
							),
						() =>
							import('@tinyslice/logger-plugin').then(
								(plugin) =>
									new plugin.TinySliceLoggerPlugin({
										onlyTimers: true,
										disableGrouping: false,
										ignoreActions: [/.*timer.*/, /.*move.*/, /.*resize.*/],
									}),
							),
					);
				} else {
					rootSlice$.setPlugins(plugins);
					return of();
				}
			}),
		),
	);
}
