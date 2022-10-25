import type { DragEvent, Element, Interactable } from '@interactjs/types';
import type { CoordinateLike } from 'common';
import interact from 'interactjs';

export type MoveListener = (coord: CoordinateLike) => void;
export const movable = (
	interactable: Interactable,
	element: HTMLElement,
	moved: MoveListener
): Interactable => {
	const titleBar = element.getElementsByClassName('title-bar').item(0);
	return interactable.draggable({
		allowFrom: titleBar ? (titleBar as Element) : element,
		modifiers: [
			interact.modifiers.snap({
				targets: [
					interact.createSnapGrid({
						x: 2,
						y: 2,
					}),
				],
				range: Infinity,
			}),
		],
		listeners: {
			move: (event: DragEvent) => {
				if (!event.target.classList.contains('immobile')) {
					moved({ x: event.dx, y: event.dy });
				}
			},
		},
	});
};
