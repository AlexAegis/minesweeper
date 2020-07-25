import { SvelteSubject } from '../helper';
import { Coordinate, MinesweeperGame } from './minesweeper';

export const score$ = new SvelteSubject<number>(0);
export const game$ = new SvelteSubject<MinesweeperGame | undefined>(undefined);

export async function startGame(
	width: number,
	height: number,
	m: number,
	x: number,
	y: number
): Promise<void> {
	const mineSweeper = new MinesweeperGame(width, height, m, new Coordinate(x, y));
	game$.next(mineSweeper);
}
