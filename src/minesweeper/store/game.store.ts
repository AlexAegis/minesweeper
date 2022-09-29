import {
	asyncScheduler,
	combineLatest,
	filter,
	map,
	merge,
	throttleTime,
	withLatestFrom,
} from 'rxjs';
import { GAME_PRESETS, type GamePreset, type WinData } from '../consts/game-presets.conts';
import { FieldMark, type CoordinateLike } from '../core';
import { rootSlice$ } from './root.store';
import { MINESWEEPER_ACTION_PREFIX, scope } from './scope';

export interface Game {
	preset: GamePreset;
	instance: GameInstance | undefined;
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
	value: number;
	isMine: boolean;
	mark: FieldMark;
	error: boolean;
	revealed: boolean;
	isPressed: boolean;
}

export interface GameInstance {
	elapsedTime: number;
	clickCount: number;
	gameState: GameState;
	tiles: Record<string, TileInstance>;
}

export const getCoordinateKey = (x: number, y: number) => `${x},${y}`;

export const minesweeperActions = {
	tryStartGame: scope.createAction<CoordinateLike>(`${MINESWEEPER_ACTION_PREFIX} try start`),
	restartGameInstance: scope.createAction<void>(
		`${MINESWEEPER_ACTION_PREFIX} restart game instance`
	),
	resetGameInstance: scope.createAction<GamePreset>(
		`${MINESWEEPER_ACTION_PREFIX} reset game instance`
	),
	revealTile: scope.createAction(`${MINESWEEPER_ACTION_PREFIX} reveal tile`),
	leftclickDown: scope.createAction<CoordinateLike>(
		`${MINESWEEPER_ACTION_PREFIX} leftclick down`
	),
	leftclickUp: scope.createAction<CoordinateLike>(`${MINESWEEPER_ACTION_PREFIX} leftclick up`),
	rightclickUp: scope.createAction<CoordinateLike>(`${MINESWEEPER_ACTION_PREFIX} rightclick up`),
	addGameToHistory: scope.createAction<WinData>(
		`${MINESWEEPER_ACTION_PREFIX} add game to history`
	),
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
				error: false,
				isMine: false,
				mark: FieldMark.EMTPY,
				revealed: false,
				value: 0,
				isPressed: false,
			};
		}
	}

	return gameInstanceInitialState;
};

export const game$ = rootSlice$.addSlice<Game>('game', {
	preset: GAME_PRESETS.beginner,
	instance: undefined,
	history: [],
});

export const gamePreset$ = game$.slice('preset');
export const gameWidthArray$ = gamePreset$.pipe(map((preset) => [...Array(preset.width).keys()]));
export const gameHeightArray$ = gamePreset$.pipe(map((preset) => [...Array(preset.height).keys()]));

export const gameInstance$ = game$.slice('instance', [
	minesweeperActions.resetGameInstance.reduce((_state, preset) => ({
		...generateGameInstance(preset),
	})),
]);

export const winHistory$ = game$.slice('history', [
	minesweeperActions.addGameToHistory.reduce((state, payload) =>
		[...state, payload].sort((a, b) => a.time - b.time)
	),
]);

export const gameState$ = gameInstance$.slice('gameState');

export const gameWon$ = gameState$.pipe(map((gameState) => gameState === GameState.WON));

export const gameLost$ = gameState$.pipe(map((gameState) => gameState === GameState.LOST));
export const gameEnded$ = merge(gameWon$, gameLost$);

export const elapsedTime$ = gameInstance$.slice('elapsedTime');
export const gameTiles$ = gameInstance$.sliceSelect(
	(slice) => slice?.tiles,
	(slice, subSlice) => ({ ...slice, tiles: subSlice })
);

export const getGameTileState = (x: number, y: number) =>
	gameTiles$.pipe(map((tiles) => tiles[getCoordinateKey(x, y)]));

export const tilesFlagged$ = gameTiles$.pipe(
	map((tiles) => Object.values(tiles).filter((tile) => tile.mark === FieldMark.FLAG).length)
);

export const isATilePressed$ = gameTiles$.pipe(
	map((tiles) => Object.values(tiles).filter((tile) => tile.isPressed).length > 0)
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

/**
 * If try start is valid, reset the game
 */
scope.createEffect(
	minesweeperActions.tryStartGame.pipe(
		withLatestFrom(gamePreset$),
		filter(([{ x, y }, preset]) => x > 0 && y > 0 && x <= preset.width && y <= preset.height),
		map(([, preset]) => minesweeperActions.resetGameInstance.makePacket(preset))
	)
);

/**
 * If try start is valid, reset the game
 */
scope.createEffect(
	minesweeperActions.restartGameInstance.pipe(
		withLatestFrom(gamePreset$),
		map(([, preset]) => minesweeperActions.resetGameInstance.makePacket(preset))
	)
);

scope.createEffect(
	gameWon$.pipe(
		withLatestFrom(elapsedTime$, gamePreset$),
		map(([, time, preset], id) => ({ preset, time, id } as WinData)),
		map((winData) => minesweeperActions.addGameToHistory.makePacket(winData))
	)
);
