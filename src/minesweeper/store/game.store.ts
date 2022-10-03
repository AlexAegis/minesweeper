import { entitySliceReducer, entitySliceReducerWithPrecompute } from '@tinyslice/core';
import { TinySliceHydrationPlugin } from '@tinyslice/hydration-plugin';
import {
	combineLatest,
	distinctUntilChanged,
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	of,
	shareReplay,
	startWith,
	switchMap,
	take,
	takeUntil,
	timer,
	withLatestFrom,
} from 'rxjs';
import { isTheSamePreset, type GamePreset, type WinData } from '../consts/game-presets.conts';
import {
	Coordinate,
	getNextTileMark,
	isEmptyTileMark,
	isFlagTileMark,
	isQuestionTileMark,
	TileMark,
	type CoordinateKey,
	type CoordinateLike,
} from '../core';
import {
	GameState,
	isGameLost,
	isGameOngoing,
	isGameReadyToStart,
	isGameWon,
} from '../core/game-state.enum';
import { shuffle } from '../helper';
import { debug$, rootSlice$ } from './root.store';
import { MS_TAG, scope } from './scope';

export interface Game {
	presets: Record<string, GamePreset>;
	instance: GameInstance;
	history: WinData[];
}

export enum FieldState {
	SAFE,
	MINE,
}

export enum SmileyState {
	/**
	 * Normally
	 */
	SMILING = 'ongoingSmiley',
	/**
	 * While mousedown
	 */
	SURPRISED = 'clickSmiley',
	/**
	 * If won
	 */
	COOL = 'wonSmiley',
	/**
	 * If lost...
	 */
	DEAD = 'lostSmiley',
}

export interface TileState {
	x: number;
	y: number;
	value: number;
	isMine: boolean;
	mark: TileMark;
	guessedWrong: boolean;
	revealed: boolean;
	/**
	 * Whether or not the tile should appear as pressed
	 */
	pressed: boolean;
	/**
	 * Tiles are disabled when the game is ended
	 */
	disabled: boolean;
}

export interface GameInstance {
	settings: GamePreset;
	elapsedTime: number;
	clickCount: number;
	gameState: GameState;
	enteredDebugMode: boolean;
	tiles: Record<CoordinateKey, TileState>;
}

const TILE_TAG = '[tile]';
const CLICK_TAG = '[click]';

export const minesweeperActions = {
	resetGame: scope.createAction<GamePreset | void>(`${MS_TAG} reset`),
	startGame: scope.createAction<{ safeCoordinate: CoordinateLike; mineCount: number }>(
		`${MS_TAG} start game`
	),
	setPreset: scope.createAction<{ name: string; preset: GamePreset }>(`${MS_TAG} set preset`),
	addGameToHistory: scope.createAction<WinData>(`${MS_TAG} add game to history`),
	incrementTimer: scope.createAction<number>(`${MS_TAG} increment timer ms`),
	tileActions: {
		depressTile: scope.createAction<CoordinateLike>(`${MS_TAG} ${TILE_TAG} depress`),
		revealTile: scope.createAction<CoordinateLike>(`${MS_TAG} ${TILE_TAG} reveal`),
		markTile: scope.createAction<CoordinateLike>(`${MS_TAG} ${TILE_TAG} mark`),
	},
	clickActions: {
		globalMouseUp: scope.createAction(`${MS_TAG} ${CLICK_TAG} global up`),
		leftclickDown: scope.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} left down`),
		leftclickUp: scope.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} left up`),
		middleclickDown: scope.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} middle down`),
		middleclickUp: scope.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} middle up`),
		rightclickDown: scope.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} right down`),
		rightclickUp: scope.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} right up`),
	},
};

const isAWinState = (tiles: TileState[]): boolean =>
	tiles.every((tile) => (tile.isMine && !tile.revealed) || (!tile.isMine && tile.revealed));
const isALoseState = (tiles: TileState[]): boolean =>
	tiles.some((tile) => tile.isMine && tile.revealed);
const revealEndStateReducer = (
	tiles: Record<CoordinateKey, TileState>,
	revealedTileKey: CoordinateKey
): Record<CoordinateKey, TileState> =>
	Object.entries(tiles).reduce((acc, [tileKey, tile]) => {
		if (isFlagTileMark(tile.mark) && !tile.isMine) {
			acc[tileKey] = {
				...tile,
				disabled: true,
				revealed: true,
				guessedWrong: true,
			};
		} else if (!isFlagTileMark(tile.mark) && tile.isMine) {
			acc[tileKey] = {
				...tile,
				disabled: true,
				revealed: true,
				guessedWrong: tileKey === revealedTileKey,
			};
		} else {
			acc[tileKey] = { ...tile, disabled: true };
		}
		return acc;
	}, {} as Record<CoordinateKey, TileState>);

const generateGameInstance = (settings: GamePreset): GameInstance => {
	const gameInstanceInitialState: GameInstance = {
		settings,
		elapsedTime: 0,
		clickCount: 0,
		gameState: GameState.READY_TO_START,
		tiles: {},
		enteredDebugMode: false,
	};

	for (let x = 0; x < settings.width; x++) {
		for (let y = 0; y < settings.height; y++) {
			gameInstanceInitialState.tiles[Coordinate.keyOf(x, y)] = {
				x,
				y,
				pressed: false,
				revealed: false,
				value: 0,
				isMine: false,
				mark: TileMark.EMTPY,
				guessedWrong: false,
				disabled: false,
			};
		}
	}

	return gameInstanceInitialState;
};

const CLASSIC_GAME_PRESETS = {
	beginner: {
		width: 9,
		height: 9,
		mineCount: 10,
	},
	intermediate: {
		width: 16,
		height: 16,
		mineCount: 40,
	},
	expert: {
		width: 30,
		height: 16,
		mineCount: 99,
	},
};

export const game$ = rootSlice$.addSlice<Game>('game', {
	instance: generateGameInstance(CLASSIC_GAME_PRESETS.beginner),
	history: [],
	presets: CLASSIC_GAME_PRESETS,
});

game$.addPlugin(new TinySliceHydrationPlugin('tinysliceGameSlice'));

export const presets$ = game$.slice('presets', [
	minesweeperActions.setPreset.reduce((state, { name, preset }) => ({
		...state,
		[name]: preset,
	})),
	debug$.setAction.reduce((state, debug) => {
		if (debug) {
			return {
				...state,
				debug: {
					width: 2,
					height: 2,
					mineCount: 2,
				},
			};
		} else if ('debug' in state) {
			const nextState = { ...state };
			delete nextState.debug;
			return nextState;
		} else {
			return state;
		}
	}),
]);

/**
 * Take all tiles, shuffle them, take the first n amount, those will be the mines
 */
const selectNRandomTiles = (
	tiles: CoordinateLike[],
	safeCoordinate: CoordinateLike,
	amount: number
): CoordinateLike[] => {
	const tilesCopy = [
		...tiles.filter((tile) => tile.x !== safeCoordinate.x || tile.y !== safeCoordinate.y),
	];
	shuffle(tilesCopy);
	return tilesCopy.splice(0, amount).map((tile) => ({ x: tile.x, y: tile.y } as CoordinateLike));
};

export const gameInstance$ = game$.slice('instance', [
	minesweeperActions.resetGame.reduce((state, payload) => ({
		...generateGameInstance(payload ?? state.settings),
	})),
	minesweeperActions.startGame.reduce((state, { safeCoordinate, mineCount }) => {
		const mines = selectNRandomTiles(Object.values(state.tiles), safeCoordinate, mineCount);
		const tiles: Record<string, TileState> = { ...state.tiles };

		for (const mineCoordinate of mines) {
			const mineKey = Coordinate.keyOf(mineCoordinate);
			tiles[mineKey] = { ...tiles[mineKey], isMine: true };

			for (const mineNeighbour of getNeighbouringCoordinateKeys(tiles, mineCoordinate)) {
				const tile = tiles[mineNeighbour];
				if (tile) {
					if (!tile.isMine) {
						tiles[mineNeighbour] = { ...tile, value: tile.value + 1 };
					}
				}
			}
		}
		return { ...state, gameState: GameState.ONGOING, tiles };
	}),
	minesweeperActions.tileActions.revealTile.reduce((state, revealedTile) => {
		const revealedTileKey = Coordinate.keyOf(revealedTile);
		const tiles = Object.values(state.tiles);
		const didJustWin = isAWinState(tiles);
		const didJustLose = isALoseState(tiles);
		if (didJustWin || didJustLose) {
			return {
				...state,
				gameState: didJustWin ? GameState.WON : GameState.LOST,
				tiles: revealEndStateReducer(state.tiles, revealedTileKey),
			};
		}
		return state;
	}),
	minesweeperActions.tileActions.depressTile.reduce((state) => ({
		...state,
		clickCount: state.clickCount + 1,
	})),
]);

export const enteredDebugMode$ = gameInstance$.slice('enteredDebugMode');
export const gameSettings$ = gameInstance$.slice('settings');

export const gameWidthArray$ = gameSettings$.pipe(
	map((settings) => [...Array(settings.width).keys()])
);
export const gameHeightArray$ = gameSettings$.pipe(
	map((settings) => [...Array(settings.height).keys()])
);

export const winHistory$ = game$.slice('history', [
	minesweeperActions.addGameToHistory.reduce((state, payload) => [...state, payload]),
]);

export interface HighscoreEntry {
	title: string;
	description: string;
	timeStamp: string;
	time: number;
}

export const highscoreEntries$: Observable<HighscoreEntry[]> = winHistory$.pipe(
	withLatestFrom(presets$),
	map(([winHistory, presets]) =>
		winHistory
			.map((winEntry) => {
				const presetName = Object.entries(presets).find(([, preset]) =>
					isTheSamePreset(preset, winEntry.preset)
				)?.[0];

				const seconds = winEntry.time / 1000;
				const minutes = Math.floor(seconds / 60);
				const remainingSeconds = seconds % 60;
				const timeStamp = `${minutes ? minutes + 'm ' : ''}${remainingSeconds}s`;
				return {
					title: presetName ?? 'Custom',
					description: `${winEntry.enteredDebugMode ? 'Debug ' : ''}${
						winEntry.preset.height
					}×${winEntry.preset.width} mines: ${winEntry.preset.mineCount}`,
					timeStamp,
					time: winEntry.time,
				} as HighscoreEntry;
			})
			.sort((a, b) => a.time - b.time)
	)
);

export const gameState$ = gameInstance$.slice('gameState');

export const isGameWon$ = gameState$.pipe(map(isGameWon));
export const gameWon$ = isGameWon$.pipe(
	distinctUntilChanged(),
	filter((won) => won)
);

export const isGameLost$ = gameState$.pipe(map(isGameLost));
export const gameLost$ = isGameLost$.pipe(
	distinctUntilChanged(),
	filter((lost) => lost)
);

export const isGameEnded$ = merge(isGameWon$, isGameLost$);
export const gameEnded$ = merge(gameWon$, gameLost$);
export const isGameOngoing$ = gameState$.pipe(map(isGameOngoing));
export const gameStarted$ = isGameOngoing$.pipe(
	distinctUntilChanged(),
	filter((ongoing) => ongoing)
);

export const elapsedTime$ = gameInstance$.slice('elapsedTime', [
	minesweeperActions.incrementTimer.reduce((state, elapsed) => state + elapsed),
]);

export const elapsedSeconds$ = elapsedTime$.pipe(
	map((elapsedTime) => Math.floor(elapsedTime / 1000))
);

const getNeighbouringCoordinates = (coordinate: CoordinateLike): CoordinateLike[] =>
	Object.values(Coordinate.directions).map((direction) => ({
		x: coordinate.x + direction.x,
		y: coordinate.y + direction.y,
	}));

const getNeighbouringCoordinateKeys = (
	tiles: Record<CoordinateKey, TileState>,
	coordinate: CoordinateLike
): CoordinateKey[] =>
	getNeighbouringCoordinates(coordinate)
		.map(Coordinate.keyOf)
		.filter((neighbourKey) => Object.hasOwn(tiles, neighbourKey));

const getNeighbouringTiles = (
	tiles: Record<CoordinateKey, TileState>,
	coordinate: CoordinateLike
): TileState[] => getNeighbouringCoordinateKeys(tiles, coordinate).map((tileKey) => tiles[tileKey]);

/**
 * Collects all tiles that either have no neighbouring mines or a neighbour of such tile
 */
const spillOnSafeTiles = (
	tiles: Record<CoordinateKey, TileState>,
	key: CoordinateKey,
	checked: Set<CoordinateKey> = new Set()
): CoordinateKey[] => {
	const tile = tiles[key];

	if (checked.has(key)) {
		return [];
	} else {
		checked.add(key);
	}
	if (!tile.isMine && tile.value === 0) {
		return [
			key,
			...getNeighbouringCoordinateKeys(tiles, tile).flatMap((neighbour) =>
				spillOnSafeTiles(tiles, neighbour, checked)
			),
		];
	} else if (!tile.isMine) {
		return [key];
	} else {
		return [];
	}
};

export const gameTilesSlice$ = gameInstance$.slice('tiles', [
	/**
	 * Press reducer
	 */
	minesweeperActions.tileActions.depressTile.reduce(
		entitySliceReducerWithPrecompute(
			(state, payload) => ({
				neighbours: getNeighbouringCoordinateKeys(state, payload),
				sourceTile: state[Coordinate.keyOf(payload)],
			}),
			(key, tile, payload, { neighbours, sourceTile }) => {
				const isSameTile = Coordinate.keyOf(payload) === key;
				const isANeighbour = neighbours.includes(key);

				if (isSameTile && !tile.revealed) {
					return { ...tile, pressed: true };
				}

				if (isANeighbour && sourceTile.revealed && !tile.revealed) {
					return { ...tile, pressed: true };
				}
			}
		)
	),
	minesweeperActions.tileActions.revealTile.reduce(
		entitySliceReducerWithPrecompute(
			(state, revealedTileCoord) => {
				const revealedTileKey = Coordinate.keyOf(revealedTileCoord);
				const revealedTile = state[revealedTileKey];
				const neighbourKeys = getNeighbouringCoordinateKeys(state, revealedTileCoord);
				const neighbours = getNeighbouringTiles(state, revealedTileCoord);
				// const neighbourCount = neighbours.length;
				const neighbouringMines = neighbours.filter((neighbour) => neighbour.isMine).length;
				const flaggedNeighbours = neighbours.filter((neighbour) =>
					isFlagTileMark(neighbour.mark)
				).length;
				const uncertainNeighbours = neighbours.filter((neighbour) =>
					isQuestionTileMark(neighbour.mark)
				).length;
				const canRevealNeighbours =
					neighbouringMines === flaggedNeighbours &&
					uncertainNeighbours === 0 &&
					isEmptyTileMark(revealedTile.mark);

				const checked = new Set<CoordinateKey>();
				const spill = spillOnSafeTiles(state, revealedTileKey, checked);
				if (canRevealNeighbours) {
					for (const neighbourKey of neighbourKeys) {
						spill.push(...spillOnSafeTiles(state, neighbourKey, checked));
					}
				}

				return {
					spill,
					canRevealNeighbours,
					neighbourKeys,
					revealedTileKey,
				};
			},
			(
				key,
				tile,
				_revealedTile,
				{ spill, canRevealNeighbours, revealedTileKey, neighbourKeys }
			) => {
				if (!tile.revealed && (revealedTileKey === key || spill.includes(key))) {
					if (isEmptyTileMark(tile.mark)) {
						return { ...tile, revealed: true, pressed: false };
					} else if (revealedTileKey === key) {
						return { ...tile, mark: TileMark.EMTPY, pressed: false };
					} else {
						return { ...tile, pressed: false };
					}
				} else if (
					canRevealNeighbours &&
					neighbourKeys.includes(key) &&
					isEmptyTileMark(tile.mark)
				) {
					return { ...tile, revealed: true, pressed: false };
				} else if (tile.pressed) {
					return { ...tile, pressed: false };
				}
			}
		)
	),
	minesweeperActions.tileActions.markTile.reduce(
		entitySliceReducer((key, tile, payload) => {
			if (Coordinate.keyOf(payload) === key && !tile.revealed) {
				return { ...tile, mark: getNextTileMark(tile.mark), pressed: false };
			}
		})
	),
	minesweeperActions.clickActions.globalMouseUp.reduce(
		entitySliceReducer((_key, tile, _payload) => {
			if (tile.pressed) {
				return { ...tile, pressed: false };
			}
		})
	),
]);

export const getGameTileState = (x: number, y: number): Observable<TileState> =>
	gameTilesSlice$.pipe(map((tiles) => tiles[Coordinate.keyOf(x, y)]));

const tiles$ = gameTilesSlice$.pipe(map((tiles) => Object.values(tiles)));
export const tilesFlagged$ = tiles$.pipe(
	map((tiles) => tiles.filter((tile) => isFlagTileMark(tile.mark)).length)
);
export const tilesPressed$ = tiles$.pipe(map((tiles) => tiles.filter((tile) => tile.pressed)));

export const isATilePressed$ = tilesPressed$.pipe(map((tilesPressed) => tilesPressed.length > 0));

export const tileCount$ = tiles$.pipe(map((tiles) => tiles.length));
export const mineCount$ = gameInstance$.pipe(map((instance) => instance.settings.mineCount));

export const remainingMines$ = combineLatest([mineCount$, tilesFlagged$]).pipe(
	map(([mineCount, tilesFlagged]) => mineCount - tilesFlagged)
);

export const smileyState$ = combineLatest([gameState$, isATilePressed$]).pipe(
	map(([gameState, isATilePressed]) => {
		if (isATilePressed) {
			return SmileyState.SURPRISED;
		} else {
			switch (gameState) {
				case GameState.WON:
					return SmileyState.COOL;
				case GameState.LOST:
					return SmileyState.DEAD;
				default:
					return SmileyState.SMILING;
			}
		}
	})
);

/**
 * Unpress all buttons if the mouse releases
 */
scope.createEffect(
	merge(fromEvent(document, 'mouseup'), fromEvent(document, 'mouseleave')).pipe(
		map(() => minesweeperActions.clickActions.globalMouseUp.makePacket())
	)
);

/**
 * Start the game at a safe tile and generate mines
 */
scope.createEffect(
	minesweeperActions.clickActions.leftclickUp.pipe(
		withLatestFrom(gameState$),
		filter(([, gameState]) => isGameReadyToStart(gameState)),
		map(([tile]) => tile),
		withLatestFrom(gameInstance$),
		map(([tile, preset]) =>
			minesweeperActions.startGame.makePacket({
				safeCoordinate: { x: tile.x, y: tile.y },
				mineCount: preset.settings.mineCount,
			})
		)
	)
);

/**
 * Sanitize left clicks into depress
 */
scope.createEffect(
	minesweeperActions.clickActions.leftclickDown.pipe(
		withLatestFrom(isGameEnded$),
		filter(([, isGameEnded]) => !isGameEnded),
		map(([click]) => minesweeperActions.tileActions.depressTile.makePacket(click))
	)
);

/**
 * Sanitize left clicks into reveal clicks
 */
scope.createEffect(
	minesweeperActions.clickActions.leftclickUp.pipe(
		withLatestFrom(isGameEnded$),
		filter(([, isGameEnded]) => !isGameEnded),
		map(([click]) => minesweeperActions.tileActions.revealTile.makePacket(click))
	)
);

/**
 * Sanitize right clicks
 */
scope.createEffect(
	minesweeperActions.clickActions.rightclickUp.pipe(
		withLatestFrom(isGameEnded$),
		filter(([, isGameEnded]) => !isGameEnded),
		map(([click]) => minesweeperActions.tileActions.markTile.makePacket(click))
	)
);

const TIME_TICKRATE_MS = 1000;

/**
 * Serving the first ticks time through a little anti cheat measure
 * If the first time increase would always start after X amount of time
 * if you'd refresh the page faster than that you could keep the timer at 0.
 * This will make the timer always jump ahead a second if you refresh as
 * without a mousedown event the initial time to tick is 0.
 */
const timeElapseTickrate$ = fromEvent(document, 'mousedown').pipe(
	take(1),
	map(() => TIME_TICKRATE_MS),
	startWith(0),
	shareReplay(1)
);

/**
 * Elapse time
 */
scope.createEffect(
	gameState$.pipe(
		withLatestFrom(timeElapseTickrate$),
		switchMap(([gameState, timeElapseTickrate]) =>
			isGameOngoing(gameState)
				? timer(timeElapseTickrate, TIME_TICKRATE_MS).pipe(
						takeUntil(gameEnded$),
						map(() => true)
				  )
				: of(false)
		),
		map((running) =>
			running
				? minesweeperActions.incrementTimer.makePacket(TIME_TICKRATE_MS)
				: scope.internalActionVoid.makePacket()
		)
	)
);

/**
 * Add won game to the gamehistory
 */
scope.createEffect(
	gameWon$.pipe(
		withLatestFrom(elapsedTime$, gameInstance$),
		map(
			([, time, gameInstance]) =>
				({
					preset: gameInstance.settings,
					time,
					enteredDebugMode: gameInstance.enteredDebugMode,
				} as WinData)
		),
		map((winData) => minesweeperActions.addGameToHistory.makePacket(winData))
	)
);

scope.createEffect(
	debug$.pipe(
		filter((debug) => debug),
		map(() => enteredDebugMode$.setAction.makePacket(true))
	)
);
