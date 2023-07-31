import type { CoordinateLike } from '@alexaegis/desktop-common';
import {
	PremadeGetNext,
	entitySliceReducerWithPrecompute,
	getNextKeyStrategy,
	getObjectKeysAsNumbers,
	ifLatestFrom,
	isNullish,
	type ActionPacket,
} from '@tinyslice/core';
import { Observable, filter, map, merge, mergeMap, of, take, tap, timer } from 'rxjs';
import type { MinesweeperGame } from '../../minesweeper/store/minesweeper.interface.js';
import { createMineSweeperGame } from '../../minesweeper/store/minesweeper.store.js';
import type { ResizeData } from '../components/resizable.function.js';
import {
	defaultCommonProgramWindowPreferences,
	initialWindowState,
	type BaseWindowState,
	type WindowState,
} from '../components/window-state.interface.js';

import { isNotNullish } from '@alexaegis/common';
import { documentPointerDown$, rootSlice$ } from '../../root.store.js';

import { browser } from '$app/environment';
import cheeseTerminatorIconLarge from '../../assets/desktop/w31-cheese-terminator-icon-large.png';
import minesweeperIconLarge from '../../assets/minesweeper/minesweeper-icon-large.png';
import minesweeperIconSmall from '../../assets/minesweeper/minesweeper-icon-small.png';

export type ProcessId = string;

export enum ProgramName {
	MINESWEEPER = 'minesweeper',
	CHEESE_TERMINATOR = 'cheeseTerminator',
	UNKNOWN = 'unknown',
}

export interface ProgramState {
	// title: string;
	name: ProgramName;
	/**
	 * Should be 48*48
	 */
	icon?: string | undefined;
	/**
	 * Should be 24*24
	 */
	titleBarIcon?: string | undefined;
	initialWindowState: Partial<BaseWindowState>;
}

export interface ShortcutState {
	name: string;
	icon?: string | undefined;
	program: ProgramName;
	position: CoordinateLike;
}

export interface DesktopScheme {
	kind: 'w2k' | 'w98'; // They define some some aspects like darkest shadow color, and start icon
}

export interface DesktopState {
	windows: Record<ProcessId, WindowState>;
	programs: Record<ProgramName, ProgramState>;
	shortcuts: Record<string, ShortcutState>;
	activeProcessId: ProcessId | undefined;
	lastSpawned: ProcessId | undefined;
	nextProcessId: ProcessId;
	startMenuOpen: boolean;
	activeScheme: DesktopScheme;
}

/**
 * The process identifier used for windows and their corresponding taskbar buttons
 */
export const formatPid = (
	processId: number | string,
	variant?: 'window' | 'taskbar' | undefined,
): string => `pid${processId}${variant ? '-' + variant : ''}`;

const initialInstalledPrograms: Partial<Record<ProgramName, ProgramState>> = {
	[ProgramName.MINESWEEPER]: {
		...defaultCommonProgramWindowPreferences,
		name: ProgramName.MINESWEEPER,

		icon: minesweeperIconLarge,
		titleBarIcon: minesweeperIconSmall,
		initialWindowState: {
			title: 'Minesweeper',
			resizable: false,
			fitContent: true,
			titleBarIcon: minesweeperIconSmall,
		},
	},
	[ProgramName.CHEESE_TERMINATOR]: {
		...defaultCommonProgramWindowPreferences,
		name: ProgramName.CHEESE_TERMINATOR,

		icon: cheeseTerminatorIconLarge,
		titleBarIcon: cheeseTerminatorIconLarge,
		initialWindowState: {
			title: 'Cheese Terminator',
			fitContent: true,
			resizable: false,
			titleBarIcon: cheeseTerminatorIconLarge,
		},
	},
};

export const desktop$ = rootSlice$.addSlice(
	'desktop',
	{
		windows: {},
		programs: initialInstalledPrograms,
		shortcuts: Object.values(initialInstalledPrograms).reduce<Record<string, ShortcutState>>(
			(acc, next, shortcutId) => {
				acc[shortcutId] = {
					name: next.initialWindowState.title ?? next.name,
					position: { x: 0, y: shortcutId * 32 },
					program: next.name,
					icon: next.icon ?? next.titleBarIcon,
				};

				return acc;
			},
			{},
		),
		activeProcessId: undefined,
		lastSpawned: undefined,
		startMenuOpen: false,
		nextProcessId: '0',
		activeScheme: {
			kind: 'w2k',
		},
	} as DesktopState,
	{
		defineInternals: (slice) => {
			const actions = {
				spawnProgram: slice.createAction<ProgramName>('spawn'),
				activateProgram: slice.createAction<ProcessId | undefined>('activate'),
				moveShortcut: slice.createAction<number[]>('move shortcuts'),
			};

			return { actions };
		},
	},
);

//const reduceWindowMinimizing = (
//	state: WindowMinimizationState,
//	payload: boolean,
//): WindowMinimizationState => {
//	// If it's in a transitionary period, don't do anything
//	if (typeof state === 'string') {
//		return state;
//	} else if (!state && payload) {
//		return 'being-minimized';
//	} else if (state && !payload) {
//		return 'being-restored';
//	} else {
//		return state;
//	}
//};

export const SHORTCUT_HEIGHT = 50;
export const SHORTCUT_WIDTH = 75;

export const snapShortcutPosition = (position: CoordinateLike): CoordinateLike => {
	return {
		x: Math.floor(
			position.x - ((position.x + SHORTCUT_WIDTH / 2) % SHORTCUT_WIDTH) + SHORTCUT_WIDTH / 2,
		),
		y: Math.floor(
			position.y -
				((position.y + SHORTCUT_HEIGHT / 2) % SHORTCUT_HEIGHT) +
				SHORTCUT_HEIGHT / 2,
		),
	};
};

export const shortcuts$ = desktop$.slice('shortcuts', {
	reducers: [],
});

export const activeScheme$ = desktop$.slice('activeScheme');
export const toggleActiveSchemeKindAction = desktop$.createAction('toggleKind');
export const activeSchemeKind$ = activeScheme$.slice('kind', {
	reducers: [toggleActiveSchemeKindAction.reduce((state) => (state === 'w2k' ? 'w98' : 'w2k'))],
});

export const dicedShortcuts = shortcuts$.dice(
	{
		name: 'undefined',
		program: ProgramName.UNKNOWN,
		position: { x: 0, y: 0 },
		icon: undefined,
	} as ShortcutState,
	{
		getAllKeys: getObjectKeysAsNumbers,
		getNextKey: getNextKeyStrategy(PremadeGetNext.nextSmallest),
		defineInternals: (slice) => {
			const position$ = slice.slice('position');

			return { position$ };
		},
	},
);

export const programs$ = desktop$.slice('programs');
export const startMenuOpen$ = desktop$.slice('startMenuOpen');

export const dicedPrograms = programs$.dice(
	{
		name: ProgramName.UNKNOWN,
		title: ProgramName.UNKNOWN,
		icon: undefined,
		initialWindowState: {},
	} as ProgramState,
	{
		getAllKeys: (state) => Object.keys(state) as ProgramName[],
		getNextKey: () => ProgramName.UNKNOWN,
	},
);

const getNextProcessId = (keys: ProcessId[]) =>
	(
		keys.map((key) => Number.parseInt(key, 10)).reduce((a, b) => (a > b ? a : b), 0) + 1
	).toString();

export const windows$ = desktop$.slice('windows', {
	reducers: [
		desktop$.internals.actions.spawnProgram.reduce((state, program) => {
			const processId = getNextProcessId(Object.keys(state));
			const spawnedWindow: WindowState = {
				...initialWindowState,
				...desktop$.value.programs[program].initialWindowState,
				processId,
				program,
				zIndex: Object.keys(state).length + 1,
			};
			return { ...state, [processId]: spawnedWindow };
		}),
		desktop$.internals.actions.activateProgram.reduce(
			entitySliceReducerWithPrecompute(
				(state, payload) => {
					let windows: WindowState[] = Object.values(state);

					if (payload) {
						windows = windows.filter(
							(windowState) => windowState.processId !== payload,
						);
						windows.sort((a, b) => a.zIndex - b.zIndex);
						const windowState = state[payload];
						if (windowState) {
							windows.push(windowState);
						}
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
					return payload
						? {
								...windowState,
								zIndex: indexMap.get(key) ?? 0,
								active: windowState.processId === payload,
								minimized:
									windowState.processId === payload &&
									windowState.minimized === true
										? 'start-unminimizing' // If this is the one being activated, unminimize it
										: windowState.minimized, // Otherwise leave it alone
						  }
						: {
								...windowState,
								active: false,
						  };
				},
			),
		),
	],
	defineInternals: (slice) => {
		const activeWindowCount$ = slice.pipe(
			map(
				(windows) =>
					Object.values(windows).filter((windowState) => windowState.active).length,
			),
		);

		return { activeWindowCount$ };
	},
});

export const resizeWindow = (
	windowState: BaseWindowState,
	resizeData: ResizeData,
): BaseWindowState => {
	if (!windowState.resizable) {
		return windowState;
	} else if (isNullish(resizeData.height) && isNullish(resizeData.width)) {
		return windowState;
	} else {
		const nextWindowState = { ...windowState };

		if (isNotNullish(resizeData.width) && resizeData.width >= nextWindowState.minWidth) {
			nextWindowState.width = resizeData.width;

			if (resizeData.moveX) {
				nextWindowState.position = {
					...nextWindowState.position,
					x: nextWindowState.position.x + resizeData.moveX,
				};
			}
		}

		if (isNotNullish(resizeData.height) && resizeData.height >= nextWindowState.minHeight) {
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
			minimize: windowSlice.createAction<boolean>(`${WINDOW_ACTION} minimize`),
			restore: windowSlice.createAction(`${WINDOW_ACTION} restore`),
			move: windowSlice.createAction<CoordinateLike>(`${WINDOW_ACTION} move`),
			resize: windowSlice.createAction<ResizeData>(`${WINDOW_ACTION} resize`),
		};

		windowSlice.addReducers([windowActions.resize.reduce(resizeWindow)]);

		const maximized$ = windowSlice.slice('maximized', {
			reducers: [
				windowActions.maximize.reduce((_state) => 'start-maximizing'),
				windowActions.restore.reduce((_state) => 'start-restoring'),
			],
		});

		const minimized$ = windowSlice.slice('minimized');

		const active$ = windowSlice.slice('active', {
			reducers: [
				minimized$.setAction.reduce((_activeState, minimizationState) => {
					if (typeof minimizationState === 'boolean') {
						return !minimizationState; // Only change the active state once not mid animation
					} else if (
						minimizationState === 'start-minimizing' ||
						minimizationState === 'minimizing'
					) {
						return false;
					} else {
						return true;
					}
				}),
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

		return { windowActions, minesweeperGame, position$, maximized$, minimized$, active$ };
	},
	reducers: [],
});

export type DicedWindow = ReturnType<(typeof dicedWindows)['get']>;

export const isProgramSpawned$ = (program: ProgramName) =>
	dicedWindows.some$((window) => window.program === program);

export const isShortcutPresent$ = (program: ProgramName) =>
	dicedShortcuts.some$((shortcut) => shortcut.program === program);

export const isMinesweeperSpawned$ = isProgramSpawned$(ProgramName.MINESWEEPER);

if (browser) {
	// Initialize a fresh instance of minesweeper if there isn't one already.
	// It's done in the browser only because otherwise it would pre-render it
	// even when it's not needed
	windows$.createEffect(
		isMinesweeperSpawned$.pipe(
			take(1),
			filter((is) => !is),
			map(() => desktop$.internals.actions.spawnProgram.makePacket(ProgramName.MINESWEEPER)),
		),
	);

	const createTimedAction = <T>(options: {
		states: T[];
		time: number;
		createStartActionPacket: (state: T) => ActionPacket;
		createFinishActionPacket: (state: T) => ActionPacket;
	}): Observable<ActionPacket>[] => {
		const startPackets = options.states.map((state) => options.createStartActionPacket(state));
		const finishPackets = options.states.map((state) =>
			options.createFinishActionPacket(state),
		);

		return [
			...startPackets.map((packet) => of(packet)),
			...finishPackets.map((finishPacket) =>
				timer(options.time).pipe(map(() => finishPacket)),
			),
		];
	};

	windows$.createEffect(
		windows$.pipe(
			mergeMap((windowRecord) => {
				const windowStates = Object.values(windowRecord);

				const animationTime = 500; // 150

				const minimizationActions = createTimedAction<WindowState>({
					states: windowStates.filter(
						(windowState) => windowState.minimized === 'start-minimizing',
					),
					time: animationTime,
					createStartActionPacket: (state) =>
						dicedWindows
							.get(state.processId)
							.internals.minimized$.setAction.makePacket('minimizing'),
					createFinishActionPacket: (state) =>
						dicedWindows
							.get(state.processId)
							.internals.minimized$.setAction.makePacket(true),
				});

				const unminimizationActions = createTimedAction<WindowState>({
					states: windowStates.filter(
						(windowState) => windowState.minimized === 'start-unminimizing',
					),
					time: animationTime,
					createStartActionPacket: (state) =>
						dicedWindows
							.get(state.processId)
							.internals.minimized$.setAction.makePacket('unminimizing'),
					createFinishActionPacket: (state) =>
						dicedWindows
							.get(state.processId)
							.internals.minimized$.setAction.makePacket(false),
				});

				const maximiziationActions = createTimedAction<WindowState>({
					states: windowStates.filter(
						(windowState) => windowState.maximized === 'start-maximizing',
					),
					time: animationTime,
					createStartActionPacket: (state) =>
						dicedWindows
							.get(state.processId)
							.internals.maximized$.setAction.makePacket('maximizing'),
					createFinishActionPacket: (state) =>
						dicedWindows
							.get(state.processId)
							.internals.maximized$.setAction.makePacket(true),
				});

				const unmaximiziationActions = createTimedAction<WindowState>({
					states: windowStates.filter(
						(windowState) => windowState.maximized === 'start-restoring',
					),
					time: animationTime,
					createStartActionPacket: (state) =>
						dicedWindows
							.get(state.processId)
							.internals.maximized$.setAction.makePacket('restoring'),
					createFinishActionPacket: (state) =>
						dicedWindows
							.get(state.processId)
							.internals.maximized$.setAction.makePacket(false),
				});

				return merge([
					...minimizationActions,
					...unminimizationActions,
					...maximiziationActions,
					...unmaximiziationActions,
				]);
			}),
			mergeMap((actions) => actions),
		),
	);

	activeSchemeKind$.createEffect(
		activeSchemeKind$.pipe(
			tap((kind) => {
				if (kind === 'w2k') {
					document.body.classList.replace('w2k-scheme-classic', 'w2k-scheme-standard');
				} else {
					document.body.classList.replace('w2k-scheme-standard', 'w2k-scheme-classic');
				}
			}),
		),
	);

	desktop$.createEffect(
		programs$.pipe(
			take(1),
			map(() => programs$.updateAction.makePacket(initialInstalledPrograms)),
		),
	);

	desktop$.createEffect(
		documentPointerDown$.pipe(
			filter((event) => {
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return !elementsUnderPointer.some(
					(element) =>
						element.classList.contains('window') ||
						element.classList.contains('type-taskbar-item'),
				);
			}),
			ifLatestFrom(
				windows$.internals.activeWindowCount$,
				(activeWindowCount) => activeWindowCount > 0,
			),
			map(() => desktop$.internals.actions.activateProgram.makePacket(undefined)),
		),
	);
}
