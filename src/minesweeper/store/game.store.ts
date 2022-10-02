import { entitySliceReducer, entitySliceReducerWithPrecompute } from '@tinyslice/core';
import {
	asyncScheduler,
	combineLatest,
	distinctUntilChanged,
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	skip,
	switchMap,
	takeUntil,
	throttleTime,
	timer,
	withLatestFrom,
} from 'rxjs';
import { GAME_PRESETS, type GamePreset, type WinData } from '../consts/game-presets.conts';
import {
	Coordinate,
	getNextTileMark,
	isFlagTileMark,
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

import { rootSlice$ } from './root.store';
import { MS_TAG, scope } from './scope';

export interface Game {
	preset: GamePreset;
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
	tiles: Record<CoordinateKey, TileState>;
}

const TILE_TAG = '[tile]';
const CLICK_TAG = '[click]';

export const minesweeperActions = {
	resetGame: scope.createAction(`${MS_TAG} reset`),
	startGame: scope.createAction<{ safeCoordinate: CoordinateLike; mineCount: number }>(
		`${MS_TAG} start game`
	),
	addGameToHistory: scope.createAction<WinData>(`${MS_TAG} add game to history`),
	incrementTimer: scope.createAction<number>(`${MS_TAG} increment timer`),
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
	tiles.every((tile) => tile.isMine || tile.revealed);
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
	};

	for (let x = 0; x < settings.width; x++) {
		for (let y = 0; y < settings.height; y++) {
			gameInstanceInitialState.tiles[Coordinate.keyOf(x, y)] = {
				x,
				y,
				guessedWrong: false,
				isMine: false,
				mark: TileMark.EMTPY,
				revealed: false,
				value: 0,
				pressed: false,
				disabled: false,
			};
		}
	}

	return gameInstanceInitialState;
};

export const game$ = rootSlice$.addSlice<Game>('game', {
	preset: GAME_PRESETS.beginner,
	instance: generateGameInstance(GAME_PRESETS.beginner),
	history: [],
});

export const gamePreset$ = game$.slice('preset');
export const gameWidthArray$ = gamePreset$.pipe(map((preset) => [...Array(preset.width).keys()]));
export const gameHeightArray$ = gamePreset$.pipe(map((preset) => [...Array(preset.height).keys()]));

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
	minesweeperActions.resetGame.reduce((state) => ({
		...generateGameInstance(state.settings),
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
	minesweeperActions.tileActions.revealTile.reduce((state, tileCoordinate) => {
		const revealedTileKey = Coordinate.keyOf(tileCoordinate);
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
export const winHistory$ = game$.slice('history', [
	minesweeperActions.addGameToHistory.reduce((state, payload) =>
		[...state, payload].sort((a, b) => a.time - b.time)
	),
]);

export const gameState$ = gameInstance$.slice('gameState');

export const isGameWon$ = gameState$.pipe(map(isGameWon));
export const gameWon$ = isGameWon$.pipe(distinctUntilChanged());

export const isGameLost$ = gameState$.pipe(map(isGameLost));
export const gameLost$ = isGameLost$.pipe(distinctUntilChanged());
export const isGameEnded$ = gameState$.pipe(
	map((gameState) => isGameWon(gameState) || isGameLost(gameState))
);
export const gameEnded$ = merge(gameWon$, gameLost$);
export const isGameOngoing$ = gameState$.pipe(map(isGameOngoing));
export const gameStarted$ = isGameOngoing$.pipe(distinctUntilChanged());

export const elapsedTime$ = gameInstance$.slice('elapsedTime', [
	minesweeperActions.incrementTimer.reduce((state) => state + 1),
]);

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
			(state, payload) => spillOnSafeTiles(state, Coordinate.keyOf(payload)),
			(key, tile, payload, spill) => {
				if (Coordinate.keyOf(payload) === key || spill.includes(key)) {
					return { ...tile, revealed: true, pressed: false, mark: TileMark.EMTPY };
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
/*
export const neighbouringTiles = (x: number, y: number): Observable<TileState[]> =>
	combineLatest(
		getNeighbouringCoordinates({ x, y }).map((neighbourCoordinate) =>
			getGameTileState(neighbourCoordinate.x, neighbourCoordinate.y)
		)
	).pipe(
		map((neighbouringTiles) =>
			neighbouringTiles.filter((neighbouringTile) => !!neighbouringTile)
		)
	);

export const isANeighbourPressed = (x: number, y: number): Observable<boolean> =>
	neighbouringTiles(x, y).pipe(
		map((neighbouringTiles) =>
			neighbouringTiles.some((neighbouringTile) => neighbouringTile.pressed)
		)
	);
*/
const tiles$ = gameTilesSlice$.pipe(map((tiles) => Object.values(tiles)));
export const tilesFlagged$ = tiles$.pipe(
	map((tiles) => tiles.filter((tile) => isFlagTileMark(tile.mark)).length)
);
export const tilesPressed$ = tiles$.pipe(map((tiles) => tiles.filter((tile) => tile.pressed)));

tilesPressed$.subscribe((ti) => console.log(ti));
export const isATilePressed$ = tilesPressed$.pipe(map((tilesPressed) => tilesPressed.length > 0));

export const tileCount$ = tiles$.pipe(map((tiles) => tiles.length));
export const mineCount$ = gameInstance$.pipe(map((instance) => instance.settings.mineCount));

export const remainingMines$ = combineLatest([mineCount$, tilesFlagged$]).pipe(
	map(([mineCount, tilesFlagged]) => mineCount - tilesFlagged)
);

export const gamePresetThrottled$ = gamePreset$.pipe(
	throttleTime(50, asyncScheduler, { leading: true, trailing: true })
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
		withLatestFrom(gamePreset$),
		map(([tile, preset]) =>
			minesweeperActions.startGame.makePacket({
				safeCoordinate: { x: tile.x, y: tile.y },
				mineCount: preset.mineCount,
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

/**
 * Elapse time
 */
scope.createEffect(
	gameStarted$.pipe(
		filter((isOngoing) => isOngoing),
		switchMap(() => timer(0, 1000).pipe(takeUntil(isGameEnded$.pipe(skip(1))))),
		map((_elapsed) => minesweeperActions.incrementTimer.makePacket(1))
	)
);

/**
 * Add won game to the gamehistory
 */
scope.createEffect(
	gameEnded$.pipe(
		filter((won) => won),
		withLatestFrom(elapsedTime$, gamePreset$),
		map(([, time, preset], id) => ({ preset, time, id } as WinData)),
		map((winData) => minesweeperActions.addGameToHistory.makePacket(winData))
	)
);
