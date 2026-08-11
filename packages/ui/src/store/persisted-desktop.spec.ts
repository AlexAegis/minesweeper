import { Scope, type Slice } from '@tinyslice/core';
import {
	PACKAGE_NAME_AND_VERSION,
	PERSISTENCE_KEY,
	initializeStoreBrowserFeatures,
} from '@w2k/core';
import { beforeEach, describe, expect, it } from 'vitest';
import type { BaseWindowState, WindowState } from '../components/window-state.interface.js';
import {
	SHORTCUT_DISTANCE,
	createDesktopSlice,
	type DesktopState,
	type ProgramState,
} from './desktop.store.js';

const testProgramInstallation: ProgramState = {
	name: 'testProgram',
	icon: 'test-icon',
	initialWindowState: { title: 'Test Program', titleBarIcon: 'test-title-bar-icon' },
};

const attach = (parentSlice: Slice<Record<string, WindowState>, BaseWindowState>, key: string) => ({
	programSlice: parentSlice.addSlice(key, {}),
});

const startDesktop = () => {
	const scope = new Scope();
	const desktopSlice = createDesktopSlice(scope.createRootSlice({}), {
		testProgram: { attach, installEntry: testProgramInstallation },
	});

	// the same order, and for the same reason, the app starts up in
	initializeStoreBrowserFeatures(desktopSlice.desktop$);
	desktopSlice.reinstallPrograms();

	return desktopSlice;
};

const settle = (): Promise<void> =>
	new Promise((resolve) => {
		setTimeout(resolve, 300);
	});

/**
 * What an older build saved: the shortcut carried its own icon, an empty one
 * at that, and sat on the 32px grid of the time
 */
const saveFromAnOlderBuild = (): DesktopState => {
	const state = startDesktop().desktop$.value;
	localStorage.clear();

	return {
		...state,
		programs: { testProgram: { ...testProgramInstallation, icon: '' } },
		shortcuts: {
			0: {
				...state.shortcuts['0'],
				icon: '',
				position: { x: 0, y: 32 },
			} as DesktopState['shortcuts'][string],
		},
		debug: true,
	};
};

describe('a desktop with a persisted state', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('should start fresh instead of restoring a save from an earlier schema', () => {
		localStorage.setItem(PACKAGE_NAME_AND_VERSION, JSON.stringify(saveFromAnOlderBuild()));

		const desktopSlice = startDesktop();

		expect(desktopSlice.shortcuts$.value['0']?.position).toEqual({ x: 0, y: 0 });
		expect(desktopSlice.desktop$.value.debug).toBe(false);
	});

	it('should ignore a save that lost a key the desktop needs', () => {
		const { windows: _windows, ...saveWithoutWindows } = saveFromAnOlderBuild();
		localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(saveWithoutWindows));

		const desktopSlice = startDesktop();

		expect(desktopSlice.desktop$.value.windows).toBeDefined();
		expect(desktopSlice.shortcuts$.value['0']?.position).toEqual({ x: 0, y: 0 });
	});

	it('should re-apply the installed programs over the ones a save carries', () => {
		localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(saveFromAnOlderBuild()));

		const desktopSlice = startDesktop();

		expect(desktopSlice.programs$.value['testProgram']?.icon).toBe('test-icon');
	});

	it('should restore a moved shortcut', async () => {
		const movedPosition = { x: SHORTCUT_DISTANCE, y: SHORTCUT_DISTANCE * 2 };
		startDesktop().dicedShortcuts.get(0).internals.position$.set(movedPosition);
		await settle(); // saving is debounced

		expect(startDesktop().shortcuts$.value['0']?.position).toEqual(movedPosition);
	});
});
