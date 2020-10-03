import { random } from '../helper';

export interface CoordinateLike {
	readonly x: number;
	readonly y: number;
}

export class Coordinate implements CoordinateLike {
	public readonly x: number;
	public readonly y: number;

	public constructor(x: Coordinate);
	public constructor(x: number, y: number);
	public constructor(x: number | Coordinate, y?: number);
	public constructor(x: number | Coordinate, y?: number) {
		if (typeof x === 'number') {
			this.x = x;
			this.y = y!;
		} else {
			this.x = x.x;
			this.y = x.y;
		}
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

	public toString(): string {
		return `${this.x},${this.y}`;
	}

	public static toString(x: number, y: number): string {
		return `${x},${y}`;
	}

	public equal(x: Coordinate): boolean;
	public equal(x: number, y: number): boolean;
	public equal(x: number | Coordinate, y?: number): boolean {
		if (typeof x === 'number') {
			return this.x === x && this.y === y;
		} else {
			return this.x === x.x && this.y === x.y;
		}
	}
}
