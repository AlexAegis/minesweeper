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
	throttleTime,
	withLatestFrom,
} from 'rxjs';
import { GAME_PRESETS, type GamePreset, type WinData } from '../consts/game-presets.conts';
import { Coordinate, FieldMark, type CoordinateLike } from '../core';
import { shuffle } from '../helper';

import { rootSlice$ } from './root.store';
import { MINESWEEPER_ACTION_PREFIX, scope } from './scope';

export interface Game {
	preset: GamePreset;
	instance: GameInstance;
	history: WinData[];
}

export enum GameState {
	READY_TO_START = 'ready',
	ONGOING = 'ongoing',
	WON = 'won',
	LOST = 'lost',
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

export interface TileInstance {
	x: number;
	y: number;
	value: number;
	isMine: boolean;
	mark: FieldMark;
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
	elapsedTime: number;
	clickCount: number;
	gameState: GameState;
	tiles: Record<string, TileInstance>;
}

export const getCoordinateKey = (x: number, y: number) => `${x},${y}`;

export const minesweeperActions = {
	resetGame: scope.createAction<GamePreset>(`${MINESWEEPER_ACTION_PREFIX} reset`),
	startGame: scope.createAction<{ safeCoordinate: CoordinateLike; mineCount: number }>(
		`${MINESWEEPER_ACTION_PREFIX} start game`
	),
	revealTile: scope.createAction(`${MINESWEEPER_ACTION_PREFIX} reveal tile`),
	mouseUp: scope.createAction(`${MINESWEEPER_ACTION_PREFIX} mouse up`),
	leftclickDown: scope.createAction<CoordinateLike>(
		`${MINESWEEPER_ACTION_PREFIX} leftclick down`
	),
	leftclickUp: scope.createAction<CoordinateLike>(`${MINESWEEPER_ACTION_PREFIX} leftclick up`),
	rightclickUp: scope.createAction<CoordinateLike>(`${MINESWEEPER_ACTION_PREFIX} rightclick up`),
	addGameToHistory: scope.createAction<WinData>(
		`${MINESWEEPER_ACTION_PREFIX} add game to history`
	),
	endGame: scope.createAction<GameState>(`${MINESWEEPER_ACTION_PREFIX} end game`),
};

const generateGameInstance = (preset: GamePreset): GameInstance => {
	const gameInstanceInitialState: GameInstance = {
		elapsedTime: 0,
		clickCount: 0,
		gameState: GameState.READY_TO_START,
		tiles: {},
	};

	for (let x = 0; x < preset.width; x++) {
		for (let y = 0; y < preset.height; y++) {
			gameInstanceInitialState.tiles[getCoordinateKey(x, y)] = {
				x,
				y,
				guessedWrong: false,
				isMine: false,
				mark: FieldMark.EMTPY,
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

const getRandomizedMineKeys = (
	tiles: TileInstance[],
	safeCoordinate: CoordinateLike,
	mineCount: number
): CoordinateLike[] => {
	const tilesCopy = [
		...tiles.filter((tile) => tile.x !== safeCoordinate.x || tile.y !== safeCoordinate.y),
	];
	shuffle(tilesCopy);
	return tilesCopy.splice(mineCount).map((tile) => ({ x: tile.x, y: tile.y } as CoordinateLike));
};

export const gameInstance$ = game$.slice('instance', [
	minesweeperActions.resetGame.reduce((_state, preset) => ({
		...generateGameInstance(preset),
	})),
	minesweeperActions.startGame.reduce((state, { safeCoordinate, mineCount }) => {
		const mines = getRandomizedMineKeys(Object.values(state.tiles), safeCoordinate, mineCount);
		const tiles: Record<string, TileInstance> = { ...state.tiles };

		for (const mineCoordinate of mines) {
			for (const mineNeighbour of getNeighbouringCoordinates(mineCoordinate)) {
				const key = getCoordinateKey(mineNeighbour.x, mineCoordinate.y);
				const tile = tiles[key];
				if (tile) {
					if (!tile.isMine) {
						tiles[key] = { ...tile, value: tile.value + 1 };
					}
				}
			}
		}
		return { ...state, gameState: GameState.ONGOING, tiles };
	}),
]);

export const winHistory$ = game$.slice('history', [
	minesweeperActions.addGameToHistory.reduce((state, payload) =>
		[...state, payload].sort((a, b) => a.time - b.time)
	),
]);

export const gameState$ = gameInstance$.slice('gameState');

export const isGameWon$ = gameState$.pipe(map((gameState) => gameState === GameState.WON));
export const gameWon$ = isGameWon$.pipe(distinctUntilChanged());

export const gameLost$ = gameState$.pipe(map((gameState) => gameState === GameState.LOST));
export const gameEnded$ = merge(gameWon$.pipe(distinctUntilChanged()), gameLost$);

export const elapsedTime$ = gameInstance$.slice('elapsedTime');
const getNeighbouringCoordinates = (coordinate: CoordinateLike): CoordinateLike[] =>
	Object.values(Coordinate.directions).map((direction) => ({
		x: coordinate.x + direction.x,
		y: coordinate.y + direction.y,
	}));

const getNeighbouringCoordinateKeys = (coordinate: CoordinateLike): string[] =>
	getNeighbouringCoordinates(coordinate).map(({ x, y }) => getCoordinateKey(x, y));

export const gameTiles$ = gameInstance$.slice('tiles', [
	minesweeperActions.endGame.reduce((state) =>
		Object.entries(state).reduce((acc, [key, tile]) => {
			acc[key] = { ...tile, disabled: true };
			return acc;
		}, {} as Record<string, TileInstance>)
	),
	minesweeperActions.leftclickDown.reduce(
		entitySliceReducerWithPrecompute(
			(_state, payload) => getNeighbouringCoordinateKeys(payload),
			(key, tile, payload, neighbours) => {
				const isSameTile = getCoordinateKey(payload.x, payload.y) === key;
				if (tile.revealed) {
					if ((isSameTile || neighbours.includes(key)) && !tile.pressed) {
						return { ...tile, pressed: true };
					}
				} else if (isSameTile) {
					return { ...tile, pressed: true };
				}
			}
		)
	),
	minesweeperActions.mouseUp.reduce(
		entitySliceReducer((_key, tile, _payload) => {
			if (tile.pressed) {
				return { ...tile, pressed: false };
			}
		})
	),
]);

export const getGameTileState = (x: number, y: number): Observable<TileInstance> =>
	gameTiles$.pipe(map((tiles) => tiles[getCoordinateKey(x, y)]));

export const neighbouringTiles = (x: number, y: number): Observable<TileInstance[]> =>
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

export const tilesFlagged$ = gameTiles$.pipe(
	map((tiles) => Object.values(tiles).filter((tile) => tile.mark === FieldMark.FLAG).length)
);
// TODO: dont emit if empty
export const isATilePressed$ = gameTiles$.pipe(
	map((tiles) => Object.values(tiles).filter((tile) => tile.pressed).length > 0)
);

export const tileCount$ = gameTiles$.pipe(map((tiles) => Object.values(tiles).length));
export const mineCount$ = gameTiles$.pipe(
	map((tiles) => Object.values(tiles).filter((tile) => tile.isMine).length)
);

export const remainingMines$ = combineLatest([tileCount$, tilesFlagged$]).pipe(
	map(([tileCount, tilesFlagged]) => tileCount - tilesFlagged)
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

export const documentMouseUp$ = fromEvent(document, 'mouseup');
documentMouseUp$.subscribe(() => minesweeperActions.mouseUp.next());
/**
 * Unpress all buttons if the mouse releases
 */
// TODO: scope.createEffect(documentMouseUp$.pipe(map(() => minesweeperActions.mouseUp.makePacket())));
scope.createEffect(
	minesweeperActions.leftclickUp.pipe(
		withLatestFrom(gameState$),
		filter(([, gameState]) => gameState === GameState.READY_TO_START),
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
 * If try start is valid, reset the game
 */
/*
scope.createEffect(
	minesweeperActions.tryStartGame.pipe(
		withLatestFrom(gamePreset$),
		filter(([{ x, y }, preset]) => x > 0 && y > 0 && x <= preset.width && y <= preset.height),
		map(([, preset]) => minesweeperActions.resetGameInstance.makePacket(preset))
	)
);*/

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
