import type { Slice, TinySlicePlugin } from '@tinyslice/core';
import { TinySliceHydrationPlugin } from '@tinyslice/hydration-plugin';
import {
	Subject,
	asyncScheduler,
	from,
	fromEvent,
	of,
	scheduled,
	switchMap,
	tap,
	type Observable,
} from 'rxjs';
import { packageMetadata } from './package-metadata.js';

export const BROWSER_TAG = '[browser]';

export { packageMetadata };

export interface RootState {
	debug: boolean;
}

export const PACKAGE_NAME_AND_VERSION = `${packageMetadata.name} (${packageMetadata.version})`;

/**
 * Bump this whenever the persisted state changes shape in a way an older save
 * cannot satisfy. Saves are restored verbatim, so without a version in the key
 * a save keeps overriding the current initial state with whatever the code
 * stored back then, forever.
 *
 * The package version can't do this job: the state shape moves independently of
 * releases, and it stood still at 4.1.0 while shortcuts gained icons and their
 * positions moved onto a 75px snap grid.
 */
export const PERSISTED_STATE_SCHEMA_VERSION = 2;

export const PERSISTENCE_KEY = `${PACKAGE_NAME_AND_VERSION} [schema ${PERSISTED_STATE_SCHEMA_VERSION}]`;

/**
 * Keys written by earlier schema versions. They are dropped on startup so no
 * save from an incompatible shape lingers in a returning visitor's browser.
 */
const LEGACY_PERSISTENCE_KEYS: string[] = [PACKAGE_NAME_AND_VERSION];

const documentPointerDownSubject$ = new Subject<PointerEvent>();
const documentPointerUpSubject$ = new Subject<PointerEvent>();
const documentMouseLeaveSubject$ = new Subject<PointerEvent>();

export const documentPointerDown$ = documentPointerDownSubject$.asObservable();
export const documentPointerUp$ = documentPointerUpSubject$.asObservable();
export const documentMouseLeave$ = documentMouseLeaveSubject$.asObservable();

const dropLegacyPersistedState = (): void => {
	for (const legacyKey of LEGACY_PERSISTENCE_KEYS) {
		localStorage.removeItem(legacyKey);
	}
};

/**
 * Development aids, loaded on demand: on a deployed page they would log every
 * action into a visitor's console and pull in chunks nobody asked for.
 */
const loadDebugPlugins = async (): Promise<TinySlicePlugin<RootState>[]> => {
	const [devtools, logger] = await Promise.all([
		import('@tinyslice/devtools-plugin'),
		import('@tinyslice/logger-plugin'),
	]);

	return [
		new devtools.TinySliceDevtoolPlugin<RootState>({
			name: PACKAGE_NAME_AND_VERSION,
		}),
		new logger.TinySliceLoggerPlugin<RootState>({
			onlyTimers: true,
			disableGrouping: false,
			ignoreActions: [/.*timer.*/, /.*move.*/, /.*resize.*/],
		}),
	];
};

export const initializeStoreBrowserFeatures = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	S extends Slice<any, any, { debug$: Observable<boolean> }>,
>(
	slice: S,
) => {
	scheduled(fromEvent<PointerEvent>(document, 'pointerdown'), asyncScheduler)
		.pipe(tap(documentPointerDownSubject$))
		.subscribe();

	scheduled(fromEvent<PointerEvent>(document, 'pointerup'), asyncScheduler)
		.pipe(tap(documentPointerUpSubject$))
		.subscribe();

	scheduled(fromEvent<PointerEvent>(document, 'mouseleave'), asyncScheduler)
		.pipe(tap(documentMouseLeaveSubject$))
		.subscribe();

	dropLegacyPersistedState();

	// Restoring happens before any action runs, so this is the state the code
	// itself starts from. Keys that start out undefined are left out: they
	// don't survive being serialized, and a slice that starts as undefined
	// tolerates coming back as one.
	const keysASaveHasToCarry = Object.entries(slice.value as Record<string, unknown>)
		.filter(([_key, value]) => value !== undefined)
		.map(([key]) => key);

	/**
	 * A save is injected as it is, so one that is missing a key the code
	 * expects leaves that slice undefined, and the first action to touch it
	 * throws on every retry. Sooner an ignored save and a fresh desktop than a
	 * broken one only clearing the browser storage can recover from.
	 */
	const hasTheShapeOfTheInitialState = (state: unknown): state is RootState =>
		typeof state === 'object' &&
		state !== null &&
		keysASaveHasToCarry.every((key) => key in state);

	const persistencePlugins: TinySlicePlugin<RootState>[] = [
		new TinySliceHydrationPlugin<RootState>(PERSISTENCE_KEY, {
			validateRetrieved: hasTheShapeOfTheInitialState,
		}),
	];

	slice.setPlugins(persistencePlugins);

	// Every plugin set has to keep the very same hydration plugin instance:
	// setting plugins stops the ones that are no longer in the set, and a
	// stopped hydration plugin still restores state on startup while silently
	// never saving again.
	slice.createEffect(
		slice.internals.debug$.pipe(
			switchMap((debug) =>
				debug ? from(loadDebugPlugins()) : of([] as TinySlicePlugin<RootState>[]),
			),
			tap((debugPlugins) => {
				slice.setPlugins([...persistencePlugins, ...debugPlugins]);
			}),
		),
	);

	return slice;
};
