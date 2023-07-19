import type { CoordinateLike } from '@alexaegis/desktop-common';
import type { DragEvent, Element, Interactable } from '@interactjs/types';
import interact from 'interactjs';

export type MoveListener = (coord: CoordinateLike) => void;

export const movable = (
	interactable: Interactable,
	element: HTMLElement,
	moved: MoveListener,
): Interactable => {
	const titleBar = element.querySelectorAll('.title-bar').item(0);
	return interactable.draggable({
		allowFrom: titleBar as Element,
		modifiers: [
			interact.modifiers.snap({
				targets: [
					interact.createSnapGrid({
						x: 2,
						y: 2,
					}),
				],
				range: Number.POSITIVE_INFINITY,
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
