import { combineLatest, fromEvent, merge, Subject } from 'rxjs';
import { filter, map, mapTo, switchMap } from 'rxjs/operators';
import { SvelteSubject } from '../helper';
import type { MinesweeperGame } from './minesweeper';

export const tileClick$ = new Subject<void>();

export const documentMouseUp$ = fromEvent(document, 'mouseup');

export const isTileMouseDown$ = merge(
	tileClick$.pipe(mapTo(true)),
	documentMouseUp$.pipe(mapTo(false))
);

export const width$ = new SvelteSubject<number>(10);
export const height$ = new SvelteSubject<number>(10);
export const mineCount$ = new SvelteSubject<number>(15);

export const game$ = new SvelteSubject<MinesweeperGame | undefined>(undefined);
export const gameOn$ = game$.pipe(filter((g): g is MinesweeperGame => !!g));
export const gamestate$ = gameOn$.pipe(switchMap((g) => g.gamestate$));
export const elapsedTime$ = gameOn$.pipe(switchMap((g) => g.elapsedTime$));
export const isEnded$ = gameOn$.pipe(switchMap((g) => g.isEnded$));
export const remainingMines$ = gameOn$.pipe(switchMap((g) => g.remainingMines$));

export const dimensions$ = combineLatest([width$, height$]).pipe(
	map(([width, height]) => ({ width, height }))
);

export const colorMap: Record<number, string> = {
	0: '#000000',
	1: '#0000ff',
	2: '#008100',
	3: '#ff1300',
	4: '#000083',
	5: '#810500',
	6: '#2a9494',
	7: '#000000',
	8: '#808080',
};

export const assetMap = {
	flag: './assets/minesweeper/flag-small.png',
	mineFalse: './assets/minesweeper/mine-false-small.png',
	mine: './assets/minesweeper/mine-small.png',
	smileyClick: './assets/minesweeper/smiley-click-small.png',
	smileyLost: './assets/minesweeper/smiley-lost-small.png',
	smileyOngoing: './assets/minesweeper/smiley-ongoing-small.png',
	smileyWon: './assets/minesweeper/smiley-won-small.png',
	questionMark: './assets/minesweeper/question-mark-small.png',
};
