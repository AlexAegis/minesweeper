import type { Coordinate } from './minesweeper';

export type FlaggedDetail = {
	flagged: boolean;
	tile: Coordinate;
};

export type FlaggedEvent = Event & { detail?: FlaggedDetail };
