import { combineLatest, fromEvent, merge, of, Subject } from 'rxjs';
import { map, mapTo, startWith, switchMap } from 'rxjs/operators';
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

export const game$ = new SvelteSubject<MinesweeperGame | undefined>(undefined);

export const gamestate$ = game$.pipe(switchMap((g) => g?.gamestate$ ?? of(undefined)));
export const isEnded$ = gamestate$.pipe(
	startWith(false),
	map((g) => g === 'won' || g === 'lost')
);

export const dimensions$ = combineLatest([width$, height$]).pipe(
	map(([width, height]) => ({ width, height }))
);

export const mineCount$ = new SvelteSubject<number>(2);

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
