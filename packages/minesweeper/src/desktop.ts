import { defaultCommonProgramWindowPreferences, type ProgramState } from '@w2k/ui';
import { minesweeperIconLarge, minesweeperIconSmall } from './assets';

export const minesweeperProgramInstallation: ProgramState = {
	...defaultCommonProgramWindowPreferences,
	name: 'minesweeper',
	icon: minesweeperIconLarge,
	titleBarIcon: minesweeperIconSmall,
	initialWindowState: {
		title: 'Minesweeper',
		resizable: false,
		fitContent: true,
		titleBarIcon: minesweeperIconSmall,
	},
};
