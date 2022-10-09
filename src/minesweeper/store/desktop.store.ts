import { entitySliceReducer, isNonNullable } from '@tinyslice/core';
import { filter, map, take, takeWhile, tap } from 'rxjs';
import type { CoordinateLike } from '../core';
import type { WindowState } from '../ui/window-state.interface';
import { rootSlice$ } from './root.store';
import { scope } from './scope';

export type ProgramId = number;

export enum DesktopProgram {
	MINESWEEPER = 'minesweeper',
}

export interface DesktopState {
	lastProgramId: ProgramId;
	windows: Record<ProgramId, WindowState>;
	programs: DesktopProgram[];
}

const DESKTOP_ACTION = '[desktop]';

export const desktopActions = {
	spawn: scope.createAction<DesktopProgram>(`${DESKTOP_ACTION} spawn`),
	maximize: scope.createAction<ProgramId>(`${DESKTOP_ACTION} maximize`),
	minimize: scope.createAction<ProgramId>(`${DESKTOP_ACTION} minimize`),
	restore: scope.createAction<ProgramId>(`${DESKTOP_ACTION} restore`),
	move: scope.createAction<{ programId: ProgramId; to: CoordinateLike }>(
		`${DESKTOP_ACTION} move`
	),
	close: scope.createAction<ProgramId>(`${DESKTOP_ACTION} close`),
};

export const desktop$ = rootSlice$.addSlice<DesktopState>(
	'desktop',
	{
		lastProgramId: 0,
		windows: {},
		programs: Object.values(DesktopProgram),
	},
	[
		desktopActions.spawn.reduce((state, payload) => {
			const nextProgramId: ProgramId = state.lastProgramId + 1;
			return {
				...state,
				lastProgramId: nextProgramId,
				windows: {
					...state.windows,
					[nextProgramId]: spawnProgram(payload, nextProgramId),
				},
			};
		}),
	]
);

const spawnProgram = (program: DesktopProgram, programId: ProgramId): WindowState => {
	if (program === DesktopProgram.MINESWEEPER) {
		return {
			title: DesktopProgram.MINESWEEPER,
			programId,
			active: true,
			height: 200,
			icon: './assets/minesweeper/mine.png',
			maximized: false,
			resizable: true, // make it false
			tight: true,
			width: 200,
			x: 200,
			y: 200,
			program: DesktopProgram.MINESWEEPER,
		};
	} else {
		return {
			programId: -1,
			title: 'Error!',
			active: false,
			height: 200,
			icon: '',
			maximized: false,
			resizable: false,
			tight: true,
			width: 200,
			x: 300,
			y: 300,
			program: undefined,
		};
	}
};

export const windowSlice$ = desktop$.slice('windows', [
	desktopActions.close.reduce((state, programId) =>
		Object.entries(state)
			.filter(([key]) => key !== programId.toString())
			.reduce((acc, [id, windowState]) => {
				acc[id] = windowState;
				return acc;
			}, {})
	),
	desktopActions.maximize.reduce(
		entitySliceReducer((key, state, payload) => {
			if (payload.toString() === key.toString() && state.resizable && !state.maximized) {
				return { ...state, maximized: true };
			} else {
				return state;
			}
		})
	),
	desktopActions.restore.reduce(
		entitySliceReducer((key, state, payload) => {
			if (payload.toString() === key.toString() && state.resizable && state.maximized) {
				return { ...state, maximized: false };
			} else {
				return state;
			}
		})
	),
	desktopActions.move.reduce(
		entitySliceReducer((key, state, payload) => {
			console.log(payload.programId, key);
			if (payload.programId.toString() === key.toString()) {
				return { ...state, x: payload.to.x, y: payload.to.y };
			} else {
				return state;
			}
		})
	),
]);

export const programIds$ = windowSlice$.pipe(
	map((windowSlice) => Object.keys(windowSlice).map((key) => parseInt(key, 10) as ProgramId))
);
/*
export const windowState = (programId: ProgramId) =>
	windowSlice$.sliceSelect(
		(state) => state[programId],
		(state, windowState) => ({ ...state, [programId]: windowState })
	);
*/

export const windowState = (programId: ProgramId) =>
	windowSlice$.pipe(
		map((state) => state[programId]),
		takeWhile(isNonNullable)
	);

// Launch minesweeper if it wasnt already launched
scope.createEffect(
	windowSlice$.pipe(
		tap((a) => console.log('seffec', a)),
		take(1),
		filter(
			(state) =>
				!Object.values(state).some(
					(window) => window.program === DesktopProgram.MINESWEEPER
				)
		),
		map(() => desktopActions.spawn.makePacket(DesktopProgram.MINESWEEPER)),
		tap((a) => console.log('seffec2', a))
	)
);
