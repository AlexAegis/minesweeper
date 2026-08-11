import { Scope, type Slice } from '@tinyslice/core';
import { describe, expect, it } from 'vitest';
import type { BaseWindowState, WindowState } from '../components/window-state.interface.js';
import {
	createDesktopSlice,
	snapShortcutPosition,
	type DesktopSliceOptions,
	type ProgramState,
} from './desktop.store.js';

const testProgramInstallation: ProgramState = {
	name: 'testProgram',
	icon: 'test-icon',
	initialWindowState: { title: 'Test Program', titleBarIcon: 'test-title-bar-icon' },
};

const iconlessProgramInstallation: ProgramState = {
	name: 'iconlessProgram',
	initialWindowState: { title: 'Iconless Program', titleBarIcon: 'iconless-title-bar-icon' },
};

const attach = (parentSlice: Slice<Record<string, WindowState>, BaseWindowState>, key: string) => ({
	programSlice: parentSlice.addSlice(key, {}),
});

const createTestDesktopSlice = (options?: DesktopSliceOptions) => {
	const scope = new Scope();
	return createDesktopSlice(
		scope.createRootSlice({}),
		{
			testProgram: { attach, installEntry: testProgramInstallation },
			iconlessProgram: { attach, installEntry: iconlessProgramInstallation },
		},
		options,
	);
};

describe('createDesktopSlice', () => {
	it('should place every installed shortcut on the snap grid', () => {
		const shortcuts = Object.values(createTestDesktopSlice().shortcuts$.value);

		expect(shortcuts.length).toBe(2);
		for (const shortcut of shortcuts) {
			expect(snapShortcutPosition(shortcut.position)).toEqual(shortcut.position);
		}
	});

	it('should not stack the installed shortcuts on each other', () => {
		const positions = Object.values(createTestDesktopSlice().shortcuts$.value).map(
			(shortcut) => `${shortcut.position.x.toString()},${shortcut.position.y.toString()}`,
		);

		expect(new Set(positions).size).toBe(positions.length);
	});

	it('should name the installed shortcuts after their window title', () => {
		const shortcuts = Object.values(createTestDesktopSlice().shortcuts$.value);

		expect(shortcuts.map((shortcut) => shortcut.name)).toContain('Test Program');
	});

	// The icon is looked up from the program, a copy in the shortcut would be
	// persisted and would then outlive every later change to that program
	it('should not copy the program icon into the shortcut', () => {
		const shortcuts = Object.values(createTestDesktopSlice().shortcuts$.value);

		for (const shortcut of shortcuts) {
			expect(shortcut).not.toHaveProperty('icon');
		}
	});

	it('should point every installed shortcut at an installed program', () => {
		const desktopSlice = createTestDesktopSlice();
		const programs = desktopSlice.programs$.value;

		for (const shortcut of Object.values(desktopSlice.shortcuts$.value)) {
			expect(programs[shortcut.program]).toBeDefined();
		}
	});

	it('should keep the devtools off unless they were asked for', () => {
		expect(createTestDesktopSlice().desktop$.value.debug).toBe(false);
		expect(createTestDesktopSlice({ debug: true }).desktop$.value.debug).toBe(true);
	});

	it('should re-apply the program definitions on demand', () => {
		const desktopSlice = createTestDesktopSlice();

		// what a save from an older build would restore
		desktopSlice.programs$.update({
			testProgram: { ...testProgramInstallation, icon: '' },
		});
		expect(desktopSlice.programs$.value['testProgram']?.icon).toBe('');

		desktopSlice.reinstallPrograms();

		expect(desktopSlice.programs$.value['testProgram']?.icon).toBe('test-icon');
	});

	it('should spawn shortcuts that look like the installed ones', () => {
		const desktopSlice = createTestDesktopSlice();
		const installedShortcut = Object.values(desktopSlice.shortcuts$.value)[0];

		// A slice only starts accepting the actions its reducers were added
		// for once a sub slice registers under it, which is what rendering a
		// shortcut does. Without this the dispatch below is dropped and the
		// test passes against a reducer that never ran.
		desktopSlice.dicedShortcuts.get(installedShortcut?.shortcutId ?? 0);

		desktopSlice.shortcuts$.internals.shortcutsActions.spawnShortcut.next(
			testProgramInstallation,
		);

		const spawnedShortcut = Object.values(desktopSlice.shortcuts$.value).at(-1);

		expect(Object.keys(spawnedShortcut ?? {}).toSorted()).toEqual(
			Object.keys(installedShortcut ?? {}).toSorted(),
		);
		expect(spawnedShortcut?.name).toBe('Test Program');
	});
});
