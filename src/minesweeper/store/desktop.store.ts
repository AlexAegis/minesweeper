import { filter, map, take } from 'rxjs';
import type { CoordinateLike } from '../core';
import { initialWindowState, type WindowState } from '../ui/window-state.interface';
import type { MinesweeperGame } from './minesweeper.interface';
import { createMineSweeperGame } from './minesweeper.store';

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

export const programs$ = desktop$.slice('programs');

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
	defineInternals: (slice) => {
		slice.pipe(map((s) => s));
	},
});

export const dicedWindows = windows$.dice(initialWindowState, {
	getAllKeys: (state) => Object.keys(state),
	getNextKey: getNextProcessId,
	defineInternals: (slice) => {
		const WINDOW_ACTION = '[window]';

		const windowActions = {
			maximize: slice.createAction(`${WINDOW_ACTION} maximize`),
			minimize: slice.createAction(`${WINDOW_ACTION} minimize`),
			restore: slice.createAction(`${WINDOW_ACTION} restore`),
			move: slice.createAction<CoordinateLike>(`${WINDOW_ACTION} move`),
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
	reducers: [],
});

export const isProgramSpawned$ = (program: DesktopProgram) =>
	dicedWindows.some$((window) => window.program === program);

export const isMinesweeperSpawned$ = isProgramSpawned$(DesktopProgram.MINESWEEPER);

windows$.createEffect(
	isMinesweeperSpawned$.pipe(
		take(1),
		filter((is) => !is),
		map(() => desktopActions.spawnProgram.makePacket(DesktopProgram.MINESWEEPER))
	)
);
