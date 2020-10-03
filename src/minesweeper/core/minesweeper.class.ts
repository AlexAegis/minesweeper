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
import { shuffle } from '../../helper';
import { Coordinate } from './coordinate.class';
import { FieldMark } from './field-mark.enum';

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
	isRevealed(): boolean;
	/**
	 * Implement only simple get logic
	 */
	getMark(): FieldMark;
	/**
	 * Implement only simple get logic
	 */
	isMine(): boolean;
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
	setMine(isMine: boolean): void;
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

const isNotFlagged = <T extends Field = Field>(tile: T) => tile.getMark() === FieldMark.EMTPY;
const isFlagged = <T extends Field = Field>(tile: T) => tile.getMark() === FieldMark.FLAG;
const isQuestioned = <T extends Field = Field>(tile: T) => tile.getMark() === FieldMark.QUESTION;

export class MinesweeperGame<T extends Field = Field> implements Iterable<T> {
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

	public *[Symbol.iterator](): IterableIterator<T> {
		for (let x = 0; x < this.height; x++) {
			for (let y = 0; y < this.width; y++) {
				const tile = this.tileGetter(x, y);
				if (tile) yield tile;
			}
		}
	}

	private isOutOfBounds(x: number, y: number): boolean {
		return x > this.height || y > this.width || x < 0 || y < 0;
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
		for (const tile of this) {
			tile.setValue(0);
			tile.setMine(false);
			tile.setMark(FieldMark.EMTPY);
			tile.setError(false);
			tile.setRevealed(false);
			const onReveal = this.makeInitialOnReveal(tile);
			this.onReveals.set(tile, onReveal);
			tile.registerOnReveal(onReveal);
		}

		this.resetNotification$.next();
	}

	private increaseClicks(): void {
		this.clickCount$.next(this.clickCount$.value + 1);
	}

	private makeInitialOnReveal(tile: T): () => void {
		return () => {
			this.start(tile.getX(), tile.getY());
			this.increaseClicks();
			this.onReveals.get(tile)?.(false);
		};
	}

	/**
	 * Track the count of mine marks, and set the state of the mark
	 */
	private makeMarkLogic(tile: T): () => void {
		return () => {
			this.increaseClicks();
			if (isQuestioned(tile)) tile.setMark(FieldMark.EMTPY);
			else if (isFlagged(tile)) tile.setMark(FieldMark.QUESTION);
			else if (isNotFlagged(tile)) tile.setMark(FieldMark.FLAG);
			this.refreshFlagCounts();
		};
	}

	private refreshFlagCounts(): void {
		const { correctFlags, totalFlags } = this.countFlags();
		this.marked$.next(totalFlags);
		this.correctlyMarked$.next(correctFlags);
	}

	private countFlags(): { totalFlags: number; correctFlags: number } {
		const flaggedTiles = [...this].filter(isFlagged);
		const correctlyFlaggedTiles = flaggedTiles.filter((t) => t.isMine());
		return { totalFlags: flaggedTiles.length, correctFlags: correctlyFlaggedTiles.length };
	}

	private makeMineRevealLogic(revealingTile: T): (isOriginalReveal?: boolean) => void {
		return (isOriginalReveal = true) => {
			if (isOriginalReveal) this.increaseClicks();

			if (isOriginalReveal && !isNotFlagged(revealingTile)) {
				revealingTile.setMark(FieldMark.EMTPY);
			} else if (!revealingTile.isRevealed()) {
				this.blowUp(revealingTile);
			}
		};
	}

	private blowUp(triggeringTile: T): void {
		triggeringTile.setError(true);
		this.isBlown$.next(triggeringTile);
		for (const tile of this) {
			if (tile.isMine() && !isFlagged(tile)) {
				tile.setRevealed(true);
			}

			if (!tile.isMine() && isFlagged(tile)) {
				tile.setRevealed(true);
				tile.setError(true);
			}
		}
	}

	/**
	 * Reveal the tile if not and count it
	 */
	private makeTileRevealLogic(tile: T): (isOriginalReveal?: boolean) => void {
		return (isOriginalReveal = true) => {
			if (isOriginalReveal) this.increaseClicks();

			if (isOriginalReveal && !isNotFlagged(tile)) {
				tile.setMark(FieldMark.EMTPY);
			} else if (!tile.isRevealed() && isNotFlagged(tile)) {
				tile.setRevealed(true);
				this.revealed$.next(this.revealed$.value + 1);

				if (!tile.getValue()) {
					for (const surroundingTile of this.surrounding(tile.getX(), tile.getY())) {
						if (isNotFlagged(surroundingTile)) {
							this.onReveals.get(surroundingTile)?.(false);
						}
					}
				}
			} else if (isOriginalReveal && tile.isRevealed() && tile.getValue()) {
				const surround = this.surrounding(tile.getX(), tile.getY());
				const flaggedCount = surround.filter(isFlagged).length;
				const questionCount = surround.filter(isQuestioned).length;
				if (flaggedCount === tile.getValue() && questionCount === 0) {
					for (const surroundingTile of surround) {
						if (isNotFlagged(surroundingTile)) {
							this.onReveals.get(surroundingTile)?.(false);
						}
					}
				}
			}
		};
	}

	public static isNeighbour(x: number, y: number, ox: number, oy: number): boolean {
		return ox >= x - 1 && ox <= x + 1 && oy >= y - 1 && oy <= y + 1;
	}

	public static toLinear(width: number, x: number, y: number): number {
		return y + width * x;
	}

	public static fromLinear(width: number, n: number): [number, number] {
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
			tile?.setMine(true);
			mines.push({ x, y });
		}

		// Set values of the numbered tiles
		for (const { x, y } of mines) {
			for (const tile of this.surrounding(x, y)) {
				if (tile && !tile.isMine()) {
					tile.setValue(tile.getValue() + 1);
				}
			}
		}

		// Register logic
		for (const tile of this) {
			tile.registerOnMark(this.makeMarkLogic(tile));
			let onReveal: Revealer;
			if (tile.isMine()) {
				onReveal = this.makeMineRevealLogic(tile);
			} else {
				onReveal = this.makeTileRevealLogic(tile);
			}
			this.onReveals.set(tile, onReveal);
			tile.registerOnReveal(onReveal);
		}
	}
}
