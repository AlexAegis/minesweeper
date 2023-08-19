import {
	PremadeGetNext,
	Slice,
	entitySliceReducerWithPrecompute,
	getNextKeyStrategy,
	getObjectKeysAsNumbers,
	ifLatestFrom,
	isNullish,
	type ActionPacket,
} from '@tinyslice/core';
import { Coordinate, type CoordinateLike } from '@w2k/common';
import { Observable, filter, map, merge, mergeMap, of, take, tap, timer } from 'rxjs';

import type { ResizeData } from '../components/resizable.function.js';
import {
	initialWindowState,
	type BaseWindowState,
	type WindowState,
} from '../components/window-state.interface.js';

import { isNotNullish } from '@alexaegis/common';
import { documentPointerDown$ } from '@w2k/core';

import { browser } from '$app/environment';
import type { Rectangle } from '../components/rectangle.interface.js';

export type ProcessId = string;
export type ProgramId = string;
export type ShortcutId = number;

export interface ProgramState {
	name: ProgramId;
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
	shortcutId: ShortcutId;
	name: string;
	icon?: string | undefined;
	program: ProgramId;
	position: CoordinateLike;
	selected: boolean;
	renaming: boolean;
}

export interface DesktopScheme {
	kind: 'w2k' | 'w98'; // They define some some aspects like darkest shadow color, and start icon
}

export interface DesktopState {
	windows: Record<ProcessId, WindowState>;
	programs: Record<ProgramId, ProgramState>;
	shortcuts: Record<string, ShortcutState>;
	activeProcessId: ProcessId | undefined;
	lastSpawned: ProcessId | undefined;
	nextProcessId: ProcessId;
	startMenuOpen: boolean;
	activeScheme: DesktopScheme;
	debug: boolean;
}

/**
 * The process identifier used for windows and their corresponding taskbar buttons
 */
export const formatPid = (
	processId: number | string,
	variant?: 'window' | 'taskbar' | undefined,
): string => `pid${processId}${variant ? '-' + variant : ''}`;

export const isThereAWindowOriginatingFromPosition = (
	windows: WindowState[],
	position: CoordinateLike,
): boolean => {
	return windows.some((win) => Coordinate.equal(win.position, position));
};

export const getWorkspaceRectangle = (): DOMRect | undefined => {
	return document.querySelector('#workspace')?.getBoundingClientRect();
};

export const centerRectangleIntoRectancle = (
	toBeCentered: Pick<Rectangle, 'height' | 'width'>,
	centerOn: Rectangle,
): CoordinateLike => {
	return {
		x: centerOn.x + Math.floor(centerOn.width / 2) - Math.floor(toBeCentered.width / 2),
		y: centerOn.y + Math.floor(centerOn.height / 2) - Math.floor(toBeCentered.height / 2),
	};
};

export const SHORTCUT_DISTANCE = 75;
export const TITLE_BAR_HEIGHT = 18;

export const getNextShortcutPosition = (
	shortcuts: ShortcutState[],
	start?: CoordinateLike,
): CoordinateLike => {
	const result: CoordinateLike = start ? { ...start } : { x: 0, y: 0 };

	const workspaceRectangle = getWorkspaceRectangle();
	if (workspaceRectangle) {
		for (
			let i = 0;
			i < 1000 && shortcuts.some((shortcut) => Coordinate.equal(shortcut.position, result));
			i++
		) {
			result.y += SHORTCUT_DISTANCE;

			if (workspaceRectangle.height < result.y + TITLE_BAR_HEIGHT) {
				result.y = 0;
				result.x += SHORTCUT_DISTANCE;
			}
		}
	}

	return result;
};

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
					x: resizeData.moveX,
				};
			}
		}

		if (isNotNullish(resizeData.height) && resizeData.height >= nextWindowState.minHeight) {
			nextWindowState.height = resizeData.height;

			if (resizeData.moveY) {
				nextWindowState.position = {
					...nextWindowState.position,
					y: resizeData.moveY,
				};
			}
		}
		return nextWindowState;
	}
};

export const snapShortcutPosition = (position: CoordinateLike): CoordinateLike => {
	getNextShortcutPosition;
	return {
		x: Math.floor(
			position.x -
				((position.x + SHORTCUT_DISTANCE / 2) % SHORTCUT_DISTANCE) +
				SHORTCUT_DISTANCE / 2,
		),
		y: Math.floor(
			position.y -
				((position.y + SHORTCUT_DISTANCE / 2) % SHORTCUT_DISTANCE) +
				SHORTCUT_DISTANCE / 2,
		),
	};
};

const getNextProcessId = (keys: ProcessId[]) =>
	(
		keys.map((key) => Number.parseInt(key, 10)).reduce((a, b) => (a > b ? a : b), 0) + 1
	).toString();

export const createDesktopSlice = <
	S,
	T extends Record<
		ProgramId,
		{
			attach: (
				parentSlice: Slice<Record<string, WindowState>, BaseWindowState>,
				key: string,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			) => { programSlice: Slice<unknown, any> };
			installEntry: ProgramState;
		}
	>,
>(
	parentSlice: Slice<unknown, S>,
	programDefinitions: T,
) => {
	const preInstalledPrograms = Object.fromEntries(
		Object.entries(programDefinitions).map(([key, logic]) => [key, logic.installEntry]),
	);
	const desktop$ = parentSlice.addSlice(
		'desktop',
		{
			windows: {},
			programs: preInstalledPrograms,
			shortcuts: Object.values(preInstalledPrograms).reduce<Record<string, ShortcutState>>(
				(acc, next, shortcutId) => {
					acc[shortcutId] = {
						shortcutId: shortcutId,
						name: next.initialWindowState.title ?? next.name,
						position: { x: 0, y: shortcutId * 32 },
						program: next.name,
						icon: next.icon ?? next.titleBarIcon,
						selected: false,
						renaming: false,
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
			debug: false,
		} as DesktopState,
		{
			defineInternals: (slice) => {
				const actions = {
					spawnProgram: slice.createAction<ProgramId>('spawn'),
					activateProgram: slice.createAction<ProcessId | undefined>('activate'),
				};

				return { actions, debug$: slice.slice('debug') };
			},
		},
	);

	const shortcuts$ = desktop$.slice('shortcuts', {
		reducers: [],
		defineInternals: (slice) => {
			const shortcutsActions = {
				clearAllSelections: slice.createAction('clearAllSelections'),
				setSelection: slice.createAction<ShortcutId[]>('setSelection'),
				spawnShortcut: slice.createAction<ProgramState>('spawnShortcut'),
				deleteSelected: slice.createAction<ShortcutId>('deleteSelected'),
				moveTo: slice.createAction<{ shortcutId: ShortcutId; position: CoordinateLike }>(
					'moveTo',
				),
			};

			slice.addReducers([
				shortcutsActions.spawnShortcut.reduce((state, payload) => {
					const nextKey = getNextKeyStrategy(PremadeGetNext.nextLargest)(
						getObjectKeysAsNumbers(state),
					);
					return {
						...state,
						[nextKey]: {
							shortcutId: nextKey,
							name: payload.initialWindowState.title,
							position: getNextShortcutPosition(Object.values(state)),
							program: payload.name,
							selected: false,
							icon: payload.icon,
						},
					};
				}),
				shortcutsActions.deleteSelected.reduce((state, payload) => {
					return Object.fromEntries(
						Object.entries(state).filter(
							([shortcutId, shortcut]) =>
								!shortcut.selected && shortcutId !== payload.toString(),
						),
					);
				}),
				shortcutsActions.moveTo.reduce((state, payload) => {
					const snappedPosition = snapShortcutPosition(payload.position);
					return {
						...state,
						[payload.shortcutId]: {
							...state[payload.shortcutId],
							position: getNextShortcutPosition(
								Object.values(state).filter(
									(shortcutState) =>
										shortcutState.shortcutId !== payload.shortcutId,
								),
								snappedPosition,
							),
						},
					};
				}),
			]);

			return { shortcutsActions };
		},
	});

	const activeScheme$ = desktop$.slice('activeScheme');
	const toggleActiveSchemeKindAction = desktop$.createAction('toggleKind');
	const activeSchemeKind$ = activeScheme$.slice('kind', {
		reducers: [
			toggleActiveSchemeKindAction.reduce((state) => (state === 'w2k' ? 'w98' : 'w2k')),
		],
	});

	const dicedShortcuts = shortcuts$.dice(
		{
			shortcutId: 0,
			name: 'undefined',
			program: 'unknown',
			position: { x: 0, y: 0 },
			selected: false,
			icon: undefined,
		} as ShortcutState,
		{
			getAllKeys: getObjectKeysAsNumbers,
			getNextKey: getNextKeyStrategy(PremadeGetNext.nextLargest),
			defineInternals: (slice) => {
				slice.addReducers([
					shortcuts$.internals.shortcutsActions.setSelection.reduce((state, payload) => ({
						...state,
						selected: payload.includes(state.shortcutId),
					})),
					shortcuts$.internals.shortcutsActions.clearAllSelections.reduce((state) => ({
						...state,
						selected: false,
						renaming: false,
					})),
				]);

				const position$ = slice.slice('position');
				const selected$ = slice.slice('selected');

				return { position$, selected$ };
			},
		},
	);

	shortcuts$.createEffect(
		documentPointerDown$.pipe(
			filter((event) => {
				return event.target !== null && (event.target as HTMLElement).id === 'workspace';
			}),
			map(() => {
				return shortcuts$.internals.shortcutsActions.clearAllSelections.makePacket(
					undefined,
				);
			}),
		),
	);

	const programs$ = desktop$.slice('programs');
	const startMenuOpen$ = desktop$.slice('startMenuOpen');

	const dicedPrograms = programs$.dice(
		{
			name: 'unknown',
			title: 'Unknown',
			icon: undefined,
			initialWindowState: {},
		} as ProgramState,
		{
			getAllKeys: (state) => Object.keys(state),
			getNextKey: () => 'unknown',
		},
	);

	const windows$ = desktop$.slice('windows', {
		reducers: [
			desktop$.internals.actions.spawnProgram.reduce((state, program) => {
				const processId = getNextProcessId(Object.keys(state));
				const spawnedWindow: WindowState = {
					...initialWindowState,
					...desktop$.value.programs[program]?.initialWindowState,
					processId,
					program,
					zIndex: Object.keys(state).length + 1,
				};

				for (
					let i = 0;
					isThereAWindowOriginatingFromPosition(
						Object.values(state),
						spawnedWindow.position,
					) && i < 10;
					i++
				) {
					spawnedWindow.position = {
						x: spawnedWindow.position.x + TITLE_BAR_HEIGHT + 3,
						y: spawnedWindow.position.y + TITLE_BAR_HEIGHT + 3,
					};
				}

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

	const dicedWindows = windows$.dice(initialWindowState, {
		getAllKeys: (state) => Object.keys(state),
		getNextKey: getNextProcessId,
		defineInternals: (windowSlice) => {
			const WINDOW_ACTION = '[window]';

			const windowActions = {
				maximize: windowSlice.createAction(`${WINDOW_ACTION} maximize`),
				// minimize: windowSlice.createAction<boolean>(`${WINDOW_ACTION} minimize`),
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

			let programLogic: unknown;
			if (windowSlice.value.program) {
				const programSliceFactory = programDefinitions[windowSlice.value.program];

				if (programSliceFactory) {
					programLogic = programSliceFactory.attach(windowSlice, 'programData');
				}
			}

			return {
				windowActions,
				programLogic,
				position$,
				maximized$,
				minimized$,
				active$,
			};
		},
		reducers: [],
	});

	const isProgramSpawned$ = (program: ProgramId) =>
		dicedWindows.some$((window) => window.program === program);

	const isShortcutPresent$ = (program: ProgramId) =>
		dicedShortcuts.some$((shortcut) => shortcut.program === program);

	// TODO: This spawn-minesweeper-if-not-running should be specific to the app, not the library
	const isMinesweeperSpawned$ = isProgramSpawned$('minesweeper');

	if (browser) {
		// Initialize a fresh instance of minesweeper if there isn't one already.
		// It's done in the browser only because otherwise it would pre-render it
		// even when it's not needed
		//windows$.createEffect(
		//	isMinesweeperSpawned$.pipe(
		//		take(1),
		//		filter((is) => !is),
		//		map(() => desktop$.internals.actions.spawnProgram.makePacket('minesweeper')),
		//	),
		//);

		const createTimedAction = <T>(options: {
			states: T[];
			time: number;
			createStartActionPacket: (state: T) => ActionPacket;
			createFinishActionPacket: (state: T) => ActionPacket;
		}): Observable<ActionPacket>[] => {
			const startPackets = options.states.map((state) =>
				options.createStartActionPacket(state),
			);
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

					const animationTime = 150;

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
					const desktopElement = document.querySelector('#desktop');

					if (desktopElement) {
						if (kind === 'w2k') {
							desktopElement.classList.replace(
								'w2k-scheme-classic',
								'w2k-scheme-standard',
							);
						} else {
							desktopElement.classList.replace(
								'w2k-scheme-standard',
								'w2k-scheme-classic',
							);
						}
					}
				}),
			),
		);

		desktop$.createEffect(
			programs$.pipe(
				take(1),
				map(() => programs$.updateAction.makePacket(preInstalledPrograms)),
			),
		);

		desktop$.createEffect(
			documentPointerDown$.pipe(
				filter((event) => {
					const elementsUnderPointer = document.elementsFromPoint(
						event.pageX,
						event.pageY,
					);
					return !elementsUnderPointer.some(
						(element) =>
							element.classList.contains('window') ||
							element.classList.contains('type-taskbar-item') ||
							element.classList.contains('modal-backdrop'),
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

	return {
		desktop$,
		activeScheme$,
		toggleActiveSchemeKindAction,
		activeSchemeKind$,
		dicedShortcuts,
		shortcuts$,
		programs$,
		startMenuOpen$,
		dicedPrograms,
		windows$,
		dicedWindows,
		isProgramSpawned$,
		isShortcutPresent$,
		isMinesweeperSpawned$,
	};
};

export type DesktopSlice = ReturnType<typeof createDesktopSlice>;

export type DicedWindows = DesktopSlice['dicedWindows'];
export type DicedWindow = ReturnType<DicedWindows['get']>;
