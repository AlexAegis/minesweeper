import { Scope, type Slice } from '@tinyslice/core';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	PACKAGE_NAME_AND_VERSION,
	PERSISTENCE_KEY,
	initializeStoreBrowserFeatures,
} from './root.store.js';

interface TestState {
	debug: boolean;
	counter: number;
	nothingYet?: string | undefined;
}

const settle = (milliseconds = 300): Promise<void> =>
	new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});

const createTestSlice = (debug: boolean) => {
	const scope = new Scope();
	const rootSlice$ = scope.createRootSlice({});
	const desktop$ = rootSlice$.addSlice(
		'desktop',
		{ debug, counter: 0, nothingYet: undefined } as TestState,
		{ defineInternals: (slice) => ({ debug$: slice.slice('debug') }) },
	);

	return { desktop$, counter$: desktop$.slice('counter') };
};

const readPersistedState = (key = PERSISTENCE_KEY): TestState | undefined => {
	const persisted = localStorage.getItem(key);
	return persisted ? (JSON.parse(persisted) as TestState) : undefined;
};

describe('initializeStoreBrowserFeatures', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('should keep saving once the debug plugins are loaded', async () => {
		const { desktop$, counter$ } = createTestSlice(true);
		initializeStoreBrowserFeatures(desktop$ as unknown as Slice<unknown, TestState, never>);

		await settle(); // the debug plugins arrive through a dynamic import

		counter$.set(42);
		await settle();

		expect(readPersistedState()?.counter).toBe(42);
	});

	it('should save without the debug plugins', async () => {
		const { desktop$, counter$ } = createTestSlice(false);
		initializeStoreBrowserFeatures(desktop$ as unknown as Slice<unknown, TestState, never>);

		counter$.set(42);
		await settle();

		expect(readPersistedState()?.counter).toBe(42);
	});

	// Serializing drops the keys that hold undefined, so requiring them back
	// would make the store throw away its own saves
	it('should restore a save that is only missing keys that started out undefined', () => {
		localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({ debug: false, counter: 7 }));

		const { desktop$ } = createTestSlice(false);
		initializeStoreBrowserFeatures(desktop$ as unknown as Slice<unknown, TestState, never>);

		expect(desktop$.value.counter).toBe(7);
	});

	// Injected as it is, a save missing a key the code expects would leave
	// that slice undefined and throw on the first action touching it
	it('should ignore a save that lost a key the state needs', () => {
		localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({ counter: 7 }));

		const { desktop$ } = createTestSlice(false);
		initializeStoreBrowserFeatures(desktop$ as unknown as Slice<unknown, TestState, never>);

		expect(desktop$.value.counter).toBe(0);
	});

	it('should ignore and drop a save from an earlier schema version', async () => {
		localStorage.setItem(
			PACKAGE_NAME_AND_VERSION,
			JSON.stringify({ debug: false, counter: 7 }),
		);

		const { desktop$ } = createTestSlice(false);
		initializeStoreBrowserFeatures(desktop$ as unknown as Slice<unknown, TestState, never>);

		expect(desktop$.value.counter).toBe(0);
		expect(localStorage.getItem(PACKAGE_NAME_AND_VERSION)).toBeNull();
	});
});
