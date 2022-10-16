import { filter, map, take } from 'rxjs';
import type { CoordinateLike } from '../core';
import type { ResizeData } from '../ui/resizable.function';
import {
	initialWindowState,
	type BaseWindowState,
	type WindowState,
} from '../ui/window-state.interface';
import type { MinesweeperGame } from './minesweeper.interface';
import { createMineSweeperGame } from './minesweeper.store';

import { rootSlice$ } from './root.store';
import { scope } from './scope';

export type ProcessId = string;

export enum DesktopProgram {
	MINESWEEPER = 'minesweeper',
}

export const programSpawnWindowData: Record<DesktopProgram, Partial<BaseWindowState>> = {
	[DesktopProgram.MINESWEEPER]: { height: 257 },
};

export interface DesktopState {
	windows: Record<ProcessId, WindowState>;
	programs: DesktopProgram[];
	activeProcessId: ProcessId | undefined;
	lastSpawned: ProcessId | undefined;
	nextProcessId: ProcessId;
}

export const desktopActions = {
	spawnProgram: scope.createAction<DesktopProgram>('[Desktop] spawn'),
	activateProgram: scope.createAction<ProcessId>('[Desktop] activate'),
};

export const desktop$ = rootSlice$.addSlice('desktop', {
	windows: {},
	programs: Object.values(DesktopProgram),
	activeProcessId: undefined,
	lastSpawned: undefined,
	nextProcessId: '0',
} as DesktopState);

export const programs$ = desktop$.slice('programs');

const getNextProcessId = (keys: ProcessId[]) =>
	(keys.map((key) => parseInt(key, 10)).reduce((a, b) => (a > b ? a : b), 0) + 1).toString();

export const windows$ = desktop$.slice('windows', {
	reducers: [
		desktopActions.spawnProgram.reduce((state, program) => {
			const processId = getNextProcessId(Object.keys(state));
			const spawnedWindow: WindowState = {
				...initialWindowState,
				...programSpawnWindowData[program],
				processId,
				program,
				title: program,
			};
			return { ...state, [processId]: spawnedWindow };
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
			resize: slice.createAction<ResizeData>(`${WINDOW_ACTION} resize`),
		};

		slice.slice('maximized', {
			reducers: [
				windowActions.maximize.reduce(() => true),
				windowActions.restore.reduce(() => false),
			],
		});

		slice.addReducers([
			windowActions.resize.reduce((state, payload) => ({
				...state,
				height: payload.height,
				width: payload.width,
				position:
					payload.left || payload.top
						? {
								...state.position,
								x: state.position.x + (payload.left ?? 0),
								y: state.position.y + (payload.top ?? 0),
						  }
						: state.position,
			})),
		]);

		slice.slice('position', {
			reducers: [
				windowActions.move.reduce((state, payload) => ({
					x: state.x + payload.x,
					y: state.y + payload.y,
				})),
			],
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

export type DicedWindow = ReturnType<typeof dicedWindows['get']>;

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
