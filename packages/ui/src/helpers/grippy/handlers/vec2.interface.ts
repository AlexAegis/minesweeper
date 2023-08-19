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
