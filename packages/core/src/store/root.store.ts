import type { Slice, TinySlicePlugin } from '@tinyslice/core';
import { TinySliceHydrationPlugin } from '@tinyslice/hydration-plugin';
import {
	Subject,
	asyncScheduler,
	fromEvent,
	mergeMap,
	of,
	scheduled,
	tap,
	type Observable,
} from 'rxjs';
import packageJson from '../../../../package.json';

export const BROWSER_TAG = '[browser]';

export const packageMetadata = packageJson;

export interface RootState {
	debug: boolean;
}

export const PACKAGE_NAME_AND_VERSION = `${packageMetadata.name} (${packageMetadata.version})`;

const documentPointerDownSubject$ = new Subject<PointerEvent>();
const documentPointerUpSubject$ = new Subject<PointerEvent>();
const documentPointerMoveSubject$ = new Subject<PointerEvent>();
const documentMouseLeaveSubject$ = new Subject<PointerEvent>();
const documentContextMenuSubject$ = new Subject<PointerEvent>();

export const documentPointerDown$ = documentPointerDownSubject$.asObservable();
export const documentPointerMove$ = documentPointerMoveSubject$.asObservable();

export const documentPointerUp$ = documentPointerUpSubject$.asObservable();
export const documentMouseLeave$ = documentMouseLeaveSubject$.asObservable();
export const documentContextMenu$ = documentPointerDownSubject$.asObservable();

export const initializeStoreBrowserFeatures = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	S extends Slice<unknown, any, { debug$: Observable<boolean> }>,
>(
	slice: S,
) => {
	scheduled(fromEvent<PointerEvent>(document, 'pointerdown'), asyncScheduler)
		.pipe(tap(documentPointerDownSubject$))
		.subscribe();

	scheduled(fromEvent<PointerEvent>(document, 'pointerup'), asyncScheduler)
		.pipe(tap(documentPointerUpSubject$))
		.subscribe();

	scheduled(fromEvent<PointerEvent>(document, 'pointermove'), asyncScheduler)
		.pipe(tap(documentPointerMoveSubject$))
		.subscribe();

	scheduled(fromEvent<PointerEvent>(document, 'mouseleave'), asyncScheduler)
		.pipe(tap(documentMouseLeaveSubject$))
		.subscribe();

	scheduled(fromEvent<PointerEvent>(document, 'contextmenu'), asyncScheduler)
		.pipe(tap(documentContextMenuSubject$))
		.subscribe();

	const plugins: TinySlicePlugin<RootState>[] = [
		new TinySliceHydrationPlugin<RootState>(PACKAGE_NAME_AND_VERSION),
	];

	slice.setPlugins(plugins);

	slice.createEffect(
		slice.internals.debug$.pipe(
			mergeMap((debug) => {
				if (debug) {
					return slice.loadAndSetPlugins(
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
					slice.setPlugins(plugins);
					return of();
				}
			}),
		),
	);

	return slice;
};
