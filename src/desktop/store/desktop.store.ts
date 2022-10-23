import {
	entitySliceReducerWithPrecompute,
	ifLatestFrom,
	isNonNullable,
	isNullish,
} from '@tinyslice/core';
import { filter, fromEvent, map, take } from 'rxjs';
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

import minesweeperIcon from '../../assets/desktop/minesweeper.png';

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
	activateProgram: scope.createAction<ProcessId | undefined>('[Desktop] activate'),
};

export const desktop$ = rootSlice$.addSlice('desktop', {
	windows: {},
	programs: {
		[ProgramName.MINESWEEPER]: {
			name: ProgramName.MINESWEEPER,
			title: capitalize(ProgramName.MINESWEEPER),
			icon: minesweeperIcon,
			initialWindowState: {
				fitContent: true,
				icon: minesweeperIcon,
			},
		},
	},
	activeProcessId: undefined,
	lastSpawned: undefined,
	startMenuOpen: false,
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
				zIndex: Object.keys(state).length + 1,
			};
			return { ...state, [processId]: spawnedWindow };
		}),
		desktopActions.activateProgram.reduce(
			entitySliceReducerWithPrecompute(
				(state, payload) => {
					let windows: WindowState[] = Object.values(state);

					if (payload) {
						windows = windows.filter(
							(windowState) => windowState.processId !== payload
						);
						windows.sort((a, b) => a.zIndex - b.zIndex);
						windows.push(state[payload]);
					}

					const indexMap = windows.reduce((acc, next, i) => {
						acc.set(next.processId, i + 1);
						return acc;
					}, new Map<string, number>());

					return {
						indexMap,
					};
				},
				(key, windowState, payload, { indexMap }) => {
					if (payload) {
						return {
							...windowState,
							zIndex: indexMap.get(key) ?? 0,
							active: windowState.processId === payload,
						};
					} else {
						return {
							...windowState,
							active: false,
						};
					}
				}
			)
		),
	],
	defineInternals: (slice) => {
		const activeWindowCount$ = slice.pipe(
			map(
				(windows) =>
					Object.values(windows).filter((windowState) => windowState.active).length
			)
		);

		return { activeWindowCount$ };
	},
});

desktop$.createEffect(
	fromEvent<PointerEvent>(document, 'pointerdown').pipe(
		filter((event) => {
			const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
			return !elementsUnderPointer.some((element) => element.classList.contains('window'));
		}),
		ifLatestFrom(
			windows$.internals.activeWindowCount$,
			(activeWindowCount) => activeWindowCount > 0
		),
		map(() => desktopActions.activateProgram.makePacket(undefined))
	)
);

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
	defineInternals: (windowSlice) => {
		const WINDOW_ACTION = '[window]';

		const windowActions = {
			maximize: windowSlice.createAction(`${WINDOW_ACTION} maximize`),
			minimize: windowSlice.createAction(`${WINDOW_ACTION} minimize`),
			restore: windowSlice.createAction(`${WINDOW_ACTION} restore`),
			move: windowSlice.createAction<CoordinateLike>(`${WINDOW_ACTION} move`),
			resize: windowSlice.createAction<ResizeData>(`${WINDOW_ACTION} resize`),
		};

		windowSlice.addReducers([windowActions.resize.reduce(resizeWindow)]);

		const maximized$ = windowSlice.slice('maximized', {
			reducers: [
				windowActions.maximize.reduce(() => true),
				windowActions.restore.reduce(() => false),
			],
		});

		const position$ = windowSlice.slice('position', {
			reducers: [
				windowActions.move.reduce((state, payload) => ({
					x: state.x + payload.x,
					y: state.y + payload.y,
				})),
			],
		});

		let minesweeperGame: MinesweeperGame | undefined;
		if (windowSlice.value.program === ProgramName.MINESWEEPER) {
			minesweeperGame = createMineSweeperGame(windowSlice, 'programData');
		}

		return { windowActions, minesweeperGame, position$, maximized$ };
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
