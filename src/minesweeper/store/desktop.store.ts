import type { CoordinateLike } from '../core';
import { initialWindowState, type WindowState } from '../ui/window-state.interface';
import { createMineSweeperGame, type MinesweeperGame } from './minesweeper.store';

import { rootSlice$ } from './root.store';
import { scope } from './scope';

export type WindowId = string;

export enum DesktopProgram {
	MINESWEEPER = 'minesweeper',
}

export interface DesktopState {
	windows: Record<WindowId, WindowState>;
	programs: DesktopProgram[];
}

export const desktop$ = rootSlice$.addSlice('desktop', {
	windows: {},
	programs: Object.values(DesktopProgram),
} as DesktopState);

export const desktopActions = {
	spawnProgram: scope.createAction<DesktopProgram>('[Desktop] spawn'),
};

const getNextProcessId = (keys: WindowId[]) =>
	(keys.map((key) => parseInt(key, 10)).reduce((a, b) => (a > b ? a : b), 0) + 1).toString();

export const windows$ = desktop$.slice('windows', {
	reducers: [
		desktopActions.spawnProgram.reduce((state, program) => {
			const windowId = getNextProcessId(Object.keys(state));
			const spawnedWindow: WindowState = {
				...initialWindowState,
				windowId,
				program,
				title: program,
			};
			return { ...state, [windowId]: spawnedWindow };
		}),
	],
});

export const dicedWindows = windows$.dice({
	getAllKeys: (state) => Object.keys(state),
	getNextKey: getNextProcessId,
	defineInternals: (slice) => {
		const WINDOW_ACTION = '[window]';

		const windowActions = {
			maximize: slice.createScopedAction(`${WINDOW_ACTION} maximize`),
			minimize: slice.createScopedAction(`${WINDOW_ACTION} minimize`),
			restore: slice.createScopedAction(`${WINDOW_ACTION} restore`),
			move: slice.createScopedAction<CoordinateLike>(`${WINDOW_ACTION} move`),
		};

		slice.slice('maximized', {
			reducers: [
				windowActions.maximize.reduce(() => true),
				windowActions.restore.reduce(() => false),
			],
		});

		slice.slice('position', {
			reducers: [windowActions.move.reduce((_state, payload) => payload)],
		});

		const program$ = slice.slice('program', {
			reducers: [],
		});

		let minesweeperGame: MinesweeperGame | undefined;
		if (program$.value === DesktopProgram.MINESWEEPER) {
			minesweeperGame = createMineSweeperGame(slice, 'programData');
		}

		return { windowActions, program$, minesweeperGame };
	},
	initialState: initialWindowState,
	reducers: [],
});
