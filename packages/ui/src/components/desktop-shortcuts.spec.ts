import { Scope, type Slice } from '@tinyslice/core';
import { mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { createDesktopSlice, type ProgramState } from '../store/desktop.store.js';
import DesktopShortcuts from './desktop-shortcuts.svelte';
import { GrippyContainer } from '../helpers/grippy/grippy.js';
import type { BaseWindowState, WindowState } from './window-state.interface.js';

const testProgramInstallation: ProgramState = {
	name: 'testProgram',
	icon: 'test-icon.png',
	initialWindowState: { title: 'Test Program', titleBarIcon: 'test-title-bar-icon.png' },
};

const attach = (parentSlice: Slice<Record<string, WindowState>, BaseWindowState>, key: string) => ({
	programSlice: parentSlice.addSlice(key, {}),
});

const renderDesktopShortcuts = () => {
	const scope = new Scope();
	const desktopSlice = createDesktopSlice(scope.createRootSlice({}), {
		testProgram: { attach, installEntry: testProgramInstallation },
	});

	const target = document.createElement('div');
	document.body.append(target);

	const grippy = new GrippyContainer();
	grippy.initialize(target);

	const component = mount(DesktopShortcuts, { target, props: { grippy, desktopSlice } });

	return { component, target, desktopSlice, grippy };
};

describe('DesktopShortcuts', () => {
	afterEach(() => {
		document.body.replaceChildren();
	});

	it('should show the icon of the program a shortcut points to', () => {
		const { component, target } = renderDesktopShortcuts();

		const icon = target.querySelector<HTMLImageElement>('.shortcut img.icon');

		expect(icon?.getAttribute('src')).toBe('test-icon.png');
		expect(icon?.alt).toBe('Test Program');

		void unmount(component);
	});

	it('should follow the program when its icon changes', async () => {
		const { component, target, desktopSlice } = renderDesktopShortcuts();

		desktopSlice.programs$.update({
			testProgram: { ...testProgramInstallation, icon: 'different-icon.png' },
		});
		await Promise.resolve();

		expect(target.querySelector('.shortcut img.icon')?.getAttribute('src')).toBe(
			'different-icon.png',
		);

		void unmount(component);
	});
});
