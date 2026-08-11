import { Scope } from '@tinyslice/core';
import { createDesktopSlice, type DesktopSlice, type ProgramId } from '@w2k/ui';

import { browser } from '$app/environment';
import { initializeStoreBrowserFeatures } from '@w2k/core';
import {
	createDesktopProperties,
	DisplayProperties,
	displayPropertiesProgramInstallation,
} from '@w2k/display-properties';
import {
	createMineSweeperGame,
	Minesweeper,
	MinesweeperMenu,
	minesweeperProgramInstallation,
} from '@w2k/minesweeper';
import { Empty, type WindowComponents } from '@w2k/ui';
import type { Component } from 'svelte';

export const windowComponents: Record<ProgramId, WindowComponents> = {
	minesweeper: {
		menu: MinesweeperMenu as unknown as Component,
		content: Minesweeper as unknown as Component,
	},
	unknown: {
		menu: Empty,
		content: Empty,
	},
	displayProperties: {
		content: DisplayProperties as unknown as Component,
	},
};

export const scope = new Scope();
export const rootSlice$ = scope.createRootSlice({});

export const desktopSlice: DesktopSlice = createDesktopSlice(
	rootSlice$,
	{
		minesweeper: {
			attach: createMineSweeperGame,
			installEntry: minesweeperProgramInstallation,
		},
		displayProperties: {
			attach: createDesktopProperties,
			installEntry: displayPropertiesProgramInstallation,
		},
	},
	{ debug: import.meta.env.DEV },
);

if (browser) {
	initializeStoreBrowserFeatures(desktopSlice.desktop$);
	// Has to happen after the persisted state was restored, it re-applies the
	// program definitions this build ships over the ones a save carries
	desktopSlice.reinstallPrograms();
}
