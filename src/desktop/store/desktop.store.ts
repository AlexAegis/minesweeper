import { isNonNullable, isNullish } from '@tinyslice/core';
import { filter, map, take } from 'rxjs';
import type { CoordinateLike } from '../../common';
import type { MinesweeperGame } from '../../minesweeper/store/minesweeper.interface';
import { createMineSweeperGame } from '../../minesweeper/store/minesweeper.store';
import type { ResizeData } from '../components/resizable.function';
import {
	initialWindowState,
	type BaseWindowState,
	type WindowState,
} from '../components/window-state.interface';

import { capitalize } from '../../common';
import { rootSlice$, scope } from '../../root.store';

export type ProcessId = string;

export enum ProgramName {
	MINESWEEPER = 'minesweeper',
	UNKNOWN = 'unknown',
}

export interface ProgramData {
	name: ProgramName;
	title: string;
	icon?: string;
	initialWindowState: Partial<BaseWindowState>;
}
export interface DesktopState {
	windows: Record<ProcessId, WindowState>;
	programs: Record<ProgramName, ProgramData>;
	activeProcessId: ProcessId | undefined;
	lastSpawned: ProcessId | undefined;
	nextProcessId: ProcessId;
	startMenuOpen: boolean;
}

export const desktopActions = {
	spawnProgram: scope.createAction<ProgramName>('[Desktop] spawn'),
	activateProgram: scope.createAction<ProcessId>('[Desktop] activate'),
};

export const desktop$ = rootSlice$.addSlice('desktop', {
	windows: {},
	programs: {
		[ProgramName.MINESWEEPER]: {
			name: ProgramName.MINESWEEPER,
			title: capitalize(ProgramName.MINESWEEPER),
			icon: ProgramName.MINESWEEPER,
			initialWindowState: {
				fitContent: true,
				icon: `assets/desktop/${ProgramName.MINESWEEPER}.png`,
			},
		},
	},
	activeProcessId: undefined,
	lastSpawned: undefined,
	startMenuOpen: true,
	nextProcessId: '0',
} as DesktopState);

export const programs$ = desktop$.slice('programs');
export const startMenuOpen$ = desktop$.slice('startMenuOpen');

export const dicedPrograms = programs$.dice(
	{
		name: ProgramName.UNKNOWN,
		title: ProgramName.UNKNOWN,
		icon: undefined,
		initialWindowState: {},
	} as ProgramData,
	{
		getAllKeys: (state) => Object.keys(state) as ProgramName[],
		getNextKey: () => ProgramName.UNKNOWN,
	}
);

const getNextProcessId = (keys: ProcessId[]) =>
	(keys.map((key) => parseInt(key, 10)).reduce((a, b) => (a > b ? a : b), 0) + 1).toString();

export const windows$ = desktop$.slice('windows', {
	reducers: [
		desktopActions.spawnProgram.reduce((state, program) => {
			const processId = getNextProcessId(Object.keys(state));
			const spawnedWindow: WindowState = {
				...initialWindowState,
				...desktop$.value.programs[program]?.initialWindowState,
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

export const resizeWindow = (
	windowState: BaseWindowState,
	resizeData: ResizeData
): BaseWindowState => {
	if (isNullish(resizeData.height) && isNullish(resizeData.width)) {
		return windowState;
	} else {
		const nextWindowState = { ...windowState };

		if (isNonNullable(resizeData.width) && resizeData.width >= nextWindowState.minWidth) {
			nextWindowState.width = resizeData.width;
			if (resizeData.moveX) {
				nextWindowState.position = {
					...nextWindowState.position,
					x: nextWindowState.position.x + resizeData.moveX,
				};
			}
		}

		if (isNonNullable(resizeData.height) && resizeData.height >= nextWindowState.minHeight) {
			nextWindowState.height = resizeData.height;
			if (resizeData.moveY) {
				nextWindowState.position = {
					...nextWindowState.position,
					y: nextWindowState.position.y + resizeData.moveY,
				};
			}
		}
		return nextWindowState;
	}
};

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

		slice.addReducers([windowActions.resize.reduce(resizeWindow)]);

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
		if (program$.value === ProgramName.MINESWEEPER) {
			minesweeperGame = createMineSweeperGame(slice, 'programData');
		}

		return { windowActions, program$, minesweeperGame };
	},
	reducers: [],
});

export type DicedWindow = ReturnType<typeof dicedWindows['get']>;

export const isProgramSpawned$ = (program: ProgramName) =>
	dicedWindows.some$((window) => window.program === program);

export const isMinesweeperSpawned$ = isProgramSpawned$(ProgramName.MINESWEEPER);

windows$.createEffect(
	isMinesweeperSpawned$.pipe(
		take(1),
		filter((is) => !is),
		map(() => desktopActions.spawnProgram.makePacket(ProgramName.MINESWEEPER))
	)
);
