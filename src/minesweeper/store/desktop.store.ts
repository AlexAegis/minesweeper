import { entitySliceReducer } from '@tinyslice/core';
import {
	BehaviorSubject,
	combineLatest,
	delay,
	distinctUntilChanged,
	filter,
	map,
	switchMap,
	take,
	tap,
	withLatestFrom,
} from 'rxjs';
import type { CoordinateLike } from '../core';
import { initialWindowState, type WindowState } from '../ui/window-state.interface';
import { createMineSweeperGame } from './minesweeper.store';
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
			const spawned = spawnProgram(payload, nextProgramId);
			return {
				...state,
				lastProgramId: nextProgramId,
				windows: {
					...state.windows,
					[nextProgramId]: spawned,
				},
			};
		}),
	]
);

export const windows$ = desktop$.slice('windows', [
	desktopActions.close.reduce((state, programId) => {
		// const a = programInternals$[programId] as MinesweeperGame;
		// a.game$.unsubscribe(); // TODO: solve with sliceUntil

		const nextProgramInternals = { ...programInternals$.value };
		delete nextProgramInternals[programId];
		programInternals$.next(nextProgramInternals);

		return Object.entries(state)
			.filter(([key]) => key.toString() !== programId.toString())
			.reduce((acc, [id, windowState]) => {
				acc[id] = windowState;
				return acc;
			}, {});
	}),
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
			if (payload.programId.toString() === key.toString()) {
				return { ...state, x: payload.to.x, y: payload.to.y };
			} else {
				return state;
			}
		})
	),
]);
/*
!!!
const windowSliceOptions = {
	until: desktopActions.close.pipe(filter(payload => payload === programId))
};
*/
export const windowSlice = (programId: ProgramId) => {
	console.log('!!! windowSlice', programId);
	return windows$.addSlice<WindowState>(
		programId.toString(),
		{ ...initialWindowState, programId },
		[]
	);
};

export const windowSliceUntil = (programId: ProgramId) => {
	console.log('!!! windowSliceUntil', programId);
	return combineLatest([windows$, programInternals$]).pipe(
		filter(
			([windows, internals]) =>
				windows[programId.toString()] && internals[programId.toString()]
		),
		distinctUntilChanged(),
		tap(() => console.log('DUNNN')),
		switchMap(() =>
			windows$.addSlice<WindowState>(
				programId.toString(),
				{ ...initialWindowState, programId },
				[]
			)
		)
	);
};

export const windowWithInternals = (programId: ProgramId) => {
	return combineLatest([windows$, programInternals$]).pipe(
		filter(
			([windows, internals]) =>
				windows[programId.toString()] && internals[programId.toString()]
		),
		switchMap(([_windows, internals]) =>
			windows$
				.addSlice<WindowState>(
					programId.toString(),
					{ ...initialWindowState, programId },
					[]
				)
				.pipe(map((window) => ({ window, internals: internals[programId.toString()] })))
		)
	);
};

export const windowSelectWithInternals = (programId: ProgramId) => {
	return combineLatest([windows$, programInternals$]).pipe(
		filter(
			([windows, internals]) =>
				windows[programId.toString()] && internals[programId.toString()]
		),
		switchMap(([_windows, internals]) =>
			windows$
				.sliceSelect<WindowState>(
					(state) => state[programId.toString()],
					(state, s) => ({ ...state, [programId]: s })
				)
				.pipe(map((window) => ({ window, internals: internals[programId.toString()] })))
		)
	);
};

export const doesWindowExist = (programId: ProgramId) => {
	return combineLatest([windows$, programInternals$]).pipe(
		map(
			([windowSlice, internals]) =>
				windowSlice[programId.toString()] && internals[programId.toString()]
		),
		tap((a) => console.log('WONDOW EXISTS', a)),
		distinctUntilChanged()
	);
};

export const windowSelect = (programId: ProgramId) => {
	console.log('!!! windowSelect', programId);
	return combineLatest([windows$, programInternals$]).pipe(
		filter(
			([windowSlice, internals]) =>
				windowSlice[programId.toString()] && internals[programId.toString()]
		),
		distinctUntilChanged(),
		tap(() => console.log('DUN')),
		switchMap(() =>
			windows$.sliceSelect<WindowState>(
				(state) => state[programId.toString()],
				(state, s) => ({ ...state, [programId]: s })
			)
		)
	);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const programInternals$ = new BehaviorSubject<Record<string, any>>({});

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

export const programIds$ = windows$.pipe(
	map((windowSlice) => Object.keys(windowSlice).map((key) => parseInt(key, 10) as ProgramId))
);

// Spawn guts
windows$
	.pipe(
		delay(1),
		distinctUntilChanged(),
		withLatestFrom(programInternals$),
		tap(([windowSliceState, programInternals]) => {
			for (const [programId, windowState] of Object.entries(windowSliceState)) {
				if (programInternals[programId.toString()] === undefined) {
					console.log(
						'gut spawner',
						programId,
						windowState,
						programInternals[programId.toString()]
					);

					if (windowState.program === DesktopProgram.MINESWEEPER) {
						console.log('SPAWN NEW', programId.toString());
						const gameWindow$ = windowSlice(parseInt(programId, 10));
						const game = createMineSweeperGame(gameWindow$, 'data');
						programInternals$.next({
							...programInternals$.value,
							[programId.toString()]: game,
						});
					} else {
						console.log('SPAWN NULL', programId.toString());
						programInternals$.next({
							...programInternals$.value,
							[programId.toString()]: null,
						});
					}
				}
			}
		})
	)
	.subscribe();

console.log('asd');
/*
export const windowState = (programId: ProgramId) =>
	windowSlice$.pipe(
		map((state) => state[programId]),
		takeWhile(isNonNullable)
	);*/

// Launch minesweeper if it wasnt already launched
scope.createEffect(
	windows$.pipe(
		take(1),
		filter((s) => !Object.values(s).some((w) => w.program === DesktopProgram.MINESWEEPER)),
		map(() => desktopActions.spawn.makePacket(DesktopProgram.MINESWEEPER))
	)
);
