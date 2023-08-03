import { random } from '@alexaegis/common';

export type CoordinateKey = `${number},${number}`;

export interface CoordinateLike {
	x: number;
	y: number;
}

export class Coordinate implements CoordinateLike {
	public readonly x: number;
	public readonly y: number;

	public constructor(x: CoordinateLike);
	public constructor(x: number, y: number);
	public constructor(x: number | CoordinateLike, y?: number);
	public constructor(x: number | CoordinateLike, y?: number) {
		if (typeof x === 'number') {
			this.x = x;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.y = y!;
		} else {
			this.x = x.x;
			this.y = x.y;
		}
	}

	public static keyOf(this: void, coordinateLike: CoordinateLike): CoordinateKey;
	public static keyOf(this: void, x: number, y: number): CoordinateKey;
	public static keyOf(this: void, x: number | CoordinateLike, y?: number): CoordinateKey {
		return typeof x === 'number' ? `${x},${y ?? 0}` : `${x.x},${x.y}`;
	}

	public static random(xMin: number, xMax: number, yMin: number, yMax: number): Coordinate {
		return new Coordinate(random(xMin, xMax), random(yMin, yMax));
	}

	public static directions = {
		NORTH: new Coordinate(0, 1),
		NORTHEAST: new Coordinate(1, 1),
		EAST: new Coordinate(1, 0),
		SOUTHEAST: new Coordinate(1, -1),
		SOUTH: new Coordinate(0, -1),
		SOUTHWEST: new Coordinate(-1, -1),
		WEST: new Coordinate(-1, 0),
		NORTHWEST: new Coordinate(-1, 1),
	};

	public toString(): CoordinateKey {
		return `${this.x},${this.y}`;
	}

	public static toString(x: number, y: number): CoordinateKey {
		return `${x},${y}`;
	}

	public equal(x: Coordinate): boolean;
	public equal(x: number, y: number): boolean;
	public equal(x: number | Coordinate, y?: number): boolean {
		return typeof x === 'number'
			? this.x === x && this.y === y
			: this.x === x.x && this.y === x.y;
	}

	public static equal(a: CoordinateLike, b: CoordinateLike): boolean {
		return a.x === b.x && a.y === b.y;
	}

	public static isNeighbouring(a: CoordinateLike, b: CoordinateLike): boolean {
		return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1;
	}
}
