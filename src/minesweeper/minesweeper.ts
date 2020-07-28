import { BehaviorSubject, identity, merge, of, Subject, timer } from 'rxjs';
import {
	distinctUntilChanged,
	filter,
	map,
	mapTo,
	skip,
	switchMap,
	takeUntil,
} from 'rxjs/operators';
import { shuffle } from '../helper';
import { Coordinate } from './coordinate.class';

export type FieldMark = 'flag' | 'questionMark' | undefined;
export type Revealer = (isFlood?: boolean) => void;
export interface Field {
	/**
	 * Implement only simple get logic
	 */
	getX(): number;
	/**
	 * Implement only simple get logic
	 */
	getY(): number;
	/**
	 * Implement only simple get logic
	 */
	getValue(): number;
	/**
	 * Implement only simple get logic
	 */
	getRevealed(): boolean;
	/**
	 * Implement only simple get logic
	 */
	getMark(): FieldMark;
	/**
	 * Implement only simple get logic
	 */
	getIsMine(): boolean;
	/**
	 * Implement only simple get logic
	 */
	getError(): boolean;
	/**
	 * Implement only simple set logic
	 */
	setValue(value: number): void;
	/**
	 * Implement only simple set logic
	 */
	setRevealed(revealed: boolean): void;
	/**
	 * Implement only simple set logic
	 */
	setMark(mark: FieldMark): void;
	/**
	 * Implement only simple set logic
	 */
	setIsMine(isMine: boolean): void;
	/**
	 * Implement only simple set logic
	 */
	setError(error: boolean): void;

	/**
	 *
	 * @param callback call this on left click
	 */
	registerOnReveal(callback: Revealer): void;
	/**
	 *
	 * @param callback call this on right click
	 */
	registerOnMark(callback: Revealer): void;
}

export class MinesweeperGame<T extends Field = Field> {
	private tileCount = this.width * this.height;

	private onReveals = new Map<T, Revealer>();

	private clickCount$ = new BehaviorSubject<number>(0);
	private revealed$ = new BehaviorSubject<number>(0);
	private correctlyMarked$ = new BehaviorSubject<number>(0);
	private marked$ = new BehaviorSubject<number>(0);
	public resetNotification$ = new Subject<void>();
	private isBlown$ = new BehaviorSubject<T | undefined>(undefined);

	public isWon$ = this.revealed$.pipe(
		map((revealedCount) => revealedCount + this.mineCount >= this.tileCount)
	);

	public isOnGoing$ = this.clickCount$.pipe(
		map((c) => c > 0),
		distinctUntilChanged()
	);

	public remainingMines$ = this.marked$.pipe(map((marked) => this.mineCount - marked));

	public gamestate$ = merge(
		this.isWon$.pipe(filter(identity), mapTo('won')),
		this.isBlown$.pipe(
			filter((isBlown) => !!isBlown),
			distinctUntilChanged(),
			mapTo('lost')
		),
		this.isOnGoing$.pipe(distinctUntilChanged(), mapTo('ongoing'))
	).pipe(distinctUntilChanged());

	public isEnded$ = this.gamestate$.pipe(
		map((state) => state === 'won' || state === 'lost'),
		distinctUntilChanged()
	);

	public elapsedTime$ = this.isOnGoing$.pipe(
		switchMap((isOngoing) =>
			isOngoing ? timer(0, 1000).pipe(takeUntil(this.isEnded$.pipe(skip(1)))) : of(0)
		)
	);

	public constructor(
		private readonly height: number,
		private readonly width: number,
		private mineCount: number,
		private readonly tileGetter: (x: number, y: number) => T
	) {
		if (mineCount >= height * width - 1) {
			mineCount = height * width - 1;
		}
		this.reset();
	}

	private isOutOfBounds(x: number, y: number): boolean {
		return x > this.height || y > this.width || x < 0 || y < 0;
	}

	private forEach(callback: (t: T) => void) {
		for (let x = 0; x < this.height; x++) {
			for (let y = 0; y < this.width; y++) {
				const tile = this.tileGetter(x, y);
				if (tile) {
					callback(tile);
				}
			}
		}
	}

	private surrounding(x: number, y: number): T[] {
		return Object.values(Coordinate.directions)
			.map((direction) => this.tileGetter(x + direction.x, y + direction.y))
			.filter((t) => !!t);
	}

	public reset(): void {
		this.isBlown$.next(undefined);
		this.revealed$.next(0);
		this.correctlyMarked$.next(0);
		this.marked$.next(0);
		this.clickCount$.next(0);
		this.forEach((t) => {
			t.setValue(0);
			t.setIsMine(false);
			t.setMark(undefined);
			t.setError(false);
			t.setRevealed(false);
			const onReveal = this.makeInitialOnReveal(t);
			this.onReveals.set(t, onReveal);
			t.registerOnReveal(onReveal);
		});
		this.resetNotification$.next();
	}

	private increaseClicks(): void {
		this.clickCount$.next(this.clickCount$.value + 1);
	}

	private makeInitialOnReveal(t: T): () => void {
		return () => {
			this.start(t.getX(), t.getY());
			this.increaseClicks();
			this.onReveals.get(t)?.(false);
		};
	}

	/**
	 * Track the count of mine marks, and set the state of the mark
	 */
	private makeMarkLogic(t: T): () => void {
		return () => {
			this.increaseClicks();
			if (t.getMark() === 'questionMark') {
				t.setMark(undefined);
			} else if (t.getMark() === 'flag') {
				t.setMark('questionMark');
				this.marked$.next(this.marked$.value - 1);
				if (t.getIsMine()) this.correctlyMarked$.next(this.correctlyMarked$.value - 1);
			} else if (t.getMark() === undefined) {
				t.setMark('flag');
				this.marked$.next(this.marked$.value + 1);
				if (t.getIsMine()) this.correctlyMarked$.next(this.correctlyMarked$.value + 1);
			}
		};
	}

	private makeMineRevealLogic(t: T): (isOriginalReveal?: boolean) => void {
		return (isOriginalReveal = true) => {
			if (isOriginalReveal) this.increaseClicks();

			if (isOriginalReveal && t.getMark() !== undefined) {
				t.setMark(undefined);
			} else if (t.getRevealed() === false) {
				t.setError(true);
				this.isBlown$.next(t);
				this.forEach((tile) => {
					if (tile.getIsMine() && tile.getMark() !== 'flag') {
						tile.setRevealed(true);
					}

					if (!tile.getIsMine() && tile.getMark() === 'flag') {
						tile.setRevealed(true);
						tile.setError(true);
					}
				});
			}
		};
	}

	/**
	 * Reveal the tile if not and count it
	 */
	private makeTileRevealLogic(t: T): (isOriginalReveal?: boolean) => void {
		return (isOriginalReveal = true) => {
			if (isOriginalReveal) this.increaseClicks();

			if (isOriginalReveal && t.getMark() !== undefined) {
				t.setMark(undefined);
			} else if (!t.getRevealed() && t.getMark() === undefined) {
				t.setRevealed(true);
				this.revealed$.next(this.revealed$.value + 1);

				if (!t.getValue()) {
					for (const tile of this.surrounding(t.getX(), t.getY())) {
						if (tile.getMark() === undefined) {
							this.onReveals.get(tile)?.(false);
						}
					}
				}
			} else if (isOriginalReveal && t.getRevealed() && t.getValue()) {
				const surround = this.surrounding(t.getX(), t.getY());
				const flaggedCount = surround.filter((s) => s.getMark() === 'flag').length;
				const questionCount = surround.filter((s) => s.getMark() === 'questionMark').length;
				if (flaggedCount === t.getValue() && questionCount === 0) {
					for (const tile of surround) {
						if (tile.getMark() === undefined) {
							this.onReveals.get(tile)?.(false);
						}
					}
				}
			}
		};
	}

	static isNeighbour(x, y, ox, oy): boolean {
		return ox >= x - 1 && ox <= x + 1 && oy >= y - 1 && oy <= y + 1;
	}

	static toLinear(width: number, x: number, y: number): number {
		return y + width * x;
	}

	static fromLinear(width: number, n: number): [number, number] {
		const y = n % width;
		const x = ~~(n / width);
		return [x, y];
	}

	private toLinear(x: number, y: number): number {
		return MinesweeperGame.toLinear(this.width, x, y);
	}

	private fromLinear(n: number): [number, number] {
		return MinesweeperGame.fromLinear(this.width, n);
	}

	private start(startX: number, startY: number): void {
		if (this.isOutOfBounds(startX, startY)) {
			throw new Error('Start tile out of field');
		}

		// Reset the game
		this.reset();

		const startIndex = this.toLinear(startX, startY);
		// Generate minefield
		let a: number[] = [];
		for (let i = 0; i < this.tileCount; i++) {
			a[i] = i;
		}
		shuffle(a);
		a = a.filter((i) => startIndex !== i);
		a.splice(this.mineCount);
		const mines: { x: number; y: number }[] = [];
		for (const n of a) {
			const [x, y] = this.fromLinear(n);
			const tile = this.tileGetter(x, y);
			tile?.setIsMine(true);
			mines.push({ x, y });
		}

		// Set values of the numbered tiles
		for (const { x, y } of mines) {
			for (const tile of this.surrounding(x, y)) {
				if (tile && !tile.getIsMine()) {
					tile.setValue(tile.getValue() + 1);
				}
			}
		}

		// Register logic
		this.forEach((tile) => {
			tile.registerOnMark(this.makeMarkLogic(tile));
			let onReveal: Revealer;
			if (tile.getIsMine()) {
				onReveal = this.makeMineRevealLogic(tile);
			} else {
				onReveal = this.makeTileRevealLogic(tile);
			}
			this.onReveals.set(tile, onReveal);
			tile.registerOnReveal(onReveal);
		});
	}
}
