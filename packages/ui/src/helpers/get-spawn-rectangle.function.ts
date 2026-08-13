import type { CoordinateLike } from '@w2k/common';
import { readGlobal } from './w2k-globals.js';

/**
 * Measures an element to be used as a spawn anchor, like a context menu
 * anchor or the window a modal dialog centers itself on.
 *
 * getBoundingClientRect returns screen pixels, but spawned elements position
 * themselves inside the zoomed `#desktop`, whose css `zoom` scales fixed
 * descendants. Divide by the zoom to convert into that local coordinate
 * space, matching how the pointer-driven context menus pass their position.
 */
export const getSpawnRectangle = (
	element: HTMLElement,
): CoordinateLike & { height: number; width: number } => {
	const rectangle = element.getBoundingClientRect();
	const zoom = readGlobal('w2kZoom') || 1;
	return {
		x: rectangle.x / zoom,
		y: rectangle.y / zoom,
		height: rectangle.height / zoom,
		width: rectangle.width / zoom,
	};
};
