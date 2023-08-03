import type { CoordinateKey } from '@w2k/common';
import type { GamePreset, GameState, TileMark, WinData } from '../interfaces/index.js';
import type { createMineSweeperGame } from './minesweeper.store.js';

export interface GamePreferences {
	unlockedScheme: boolean;
	unlockedResize: boolean;
}

export interface Game {
	presets: Record<string, GamePreset>;
	instance: GameInstance;
	history: WinData[];
	cheating: boolean;
	preferences: GamePreferences;
}

export enum FieldState {
	SAFE,
	MINE,
}

export enum SmileyState {
	/**
	 * Normally
	 */
	SMILING = 'ongoing',
	/**
	 * While mousedown
	 */
	SURPRISED = 'click',
	/**
	 * If won
	 */
	COOL = 'won',
	/**
	 * If lost...
	 */
	DEAD = 'lost',
}

export type MinesweeperGame = ReturnType<typeof createMineSweeperGame>;
export type DicedTiles = MinesweeperGame['dicedTiles'];
export type TileSlice = ReturnType<DicedTiles['get']>;
export type TileSliceInternals = TileSlice['internals'];

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
	cheated: boolean;
	tiles: Record<CoordinateKey, TileState>;
}

export interface HighscoreEntry {
	title: string;
	description: string;
	timeStamp: string;
	time: number;
}
