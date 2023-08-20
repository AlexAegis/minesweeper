import type { Rectangle } from '../../../components/rectangle.interface';

export interface Vec2 {
	x: number;
	y: number;
}

export const isWithinRectangle = (rectangle: Rectangle, event: PointerEvent): boolean => {
	return (
		rectangle.x <= event.clientX &&
		rectangle.x + rectangle.width >= event.clientX &&
		rectangle.y <= event.clientY &&
		rectangle.y + rectangle.height >= event.clientY
	);
};

export const addVec = (a: Vec2, b: Vec2): Vec2 => {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
	};
};

export const subVec = (a: Vec2, b: Vec2): Vec2 => {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
	};
};

export const vecComparator = (a: Vec2, b: Vec2): number => {
	return a.y === b.y ? a.x - b.x : a.y - b.y;
};
