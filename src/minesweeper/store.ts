import { combineLatest, fromEvent, identity, merge, Observable, Subject } from 'rxjs';
import {
	filter,
	map,
	mapTo,
	scan,
	shareReplay,
	startWith,
	switchMap,
	withLatestFrom,
} from 'rxjs/operators';
import { SvelteSubject } from '../helper';
import type { MinesweeperGame } from './minesweeper';

export const tileClick$ = new Subject<[number, boolean]>();

export const documentMouseUp$ = fromEvent(document, 'mouseup');
export const tileMouseDown$ = merge(tileClick$, documentMouseUp$.pipe(mapTo(undefined)));

export const width$ = new SvelteSubject<number>(10);
export const height$ = new SvelteSubject<number>(10);
export const mineCount$ = new SvelteSubject<number>(2);

export const game$ = new SvelteSubject<MinesweeperGame | undefined>(undefined);
export const gameOn$ = game$.pipe(filter((g): g is MinesweeperGame => !!g));
export const gamestate$ = gameOn$.pipe(switchMap((g) => g.gamestate$));
export const elapsedTime$ = gameOn$.pipe(switchMap((g) => g.elapsedTime$));
export const isEnded$ = gameOn$.pipe(switchMap((g) => g.isEnded$));
export const isWon$ = gameOn$.pipe(switchMap((g) => g.isWon$));
export const remainingMines$ = gameOn$.pipe(switchMap((g) => g.remainingMines$));
export type WinData = {
	time: number;
	width: number;
	height: number;
	mineCount: number;
};
export const won$: Observable<WinData[]> = isWon$.pipe(
	filter(identity),
	withLatestFrom(elapsedTime$, width$, height$, mineCount$),
	map(([, time, width, height, mineCount]) => ({ time, width, height, mineCount })),
	scan((a, n) => {
		a.push(n);
		return a;
	}, [] as WinData[]),
	startWith([] as WinData[]),
	shareReplay(1)
);

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
	clickSmiley: './assets/minesweeper/smiley-click-small.png',
	lostSmiley: './assets/minesweeper/smiley-lost-small.png',
	ongoingSmiley: './assets/minesweeper/smiley-ongoing-small.png',
	wonSmiley: './assets/minesweeper/smiley-won-small.png',
	questionMark: './assets/minesweeper/question-mark-small.png',
};
