import { BehaviorSubject, Operator, Observable } from 'rxjs';
import { MineSweeper, Coordinate } from './minesweeper';

export class SvelteSubject<T> extends BehaviorSubject<T> {
	set(value: T) {
		super.next(value);
	}
}

export const score$ = new SvelteSubject<number>(0);
export const game$ = new SvelteSubject<MineSweeper | undefined>(undefined);

export function startGame(x: number, y: number, m: number) {
	const mineSweeper = new MineSweeper(x, y, m, new Coordinate(5, 5));
	game$.next(mineSweeper);
}
