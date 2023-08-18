import type { CoordinateLike } from '@w2k/common';
import type { Rectangle } from '../components/rectangle.interface';

export const nudgeAreaIntoArea = (areaToNudge: Rectangle, fitWithin: Rectangle): CoordinateLike => {
	return {
		x: Math.max(
			Math.min(areaToNudge.x, fitWithin.x + fitWithin.width - areaToNudge.width),
			fitWithin.x,
		),
		y: Math.max(
			Math.min(areaToNudge.y, fitWithin.y + fitWithin.height - areaToNudge.height),
			fitWithin.y,
		),
	};
};
