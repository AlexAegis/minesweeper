import { Scope } from '@tinyslice/core';
import { createDesktopSlice, type DesktopSlice, type ProgramId } from '@w2k/ui';

import { browser } from '$app/environment';
import { initializeStoreBrowserFeatures } from '@w2k/core';
import {
	createMineSweeperGame,
	Minesweeper,
	MinesweeperMenu,
	minesweeperProgramInstallation,
} from '@w2k/minesweeper';
import { Empty, type WindowComponents } from '@w2k/ui';

export const windowComponents: Record<ProgramId, WindowComponents> = {
	minesweeper: {
		menu: MinesweeperMenu,
		content: Minesweeper,
	},
	unknown: {
		menu: Empty,
		content: Empty,
	},
	cheeseTerminator: {
		menu: MinesweeperMenu,
		content: Minesweeper,
	},
};

export const scope = new Scope();
export const rootSlice$ = scope.createRootSlice({});

export const desktopSlice: DesktopSlice = createDesktopSlice(rootSlice$, {
	minesweeper: { attach: createMineSweeperGame, installEntry: minesweeperProgramInstallation },
});

if (browser) {
	initializeStoreBrowserFeatures(desktopSlice.desktop$);
}
