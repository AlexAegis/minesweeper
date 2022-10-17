import type { Interactable, ResizeEvent } from '@interactjs/types';
import interact from 'interactjs';
import { movable, type MoveListener } from './movable.function';

export interface ResizeData {
	height: number;
	width: number;
	left: number | undefined;
	top: number | undefined;
}

export type ResizeListener = (next: ResizeData) => void;

export class InteractBuilder {
	interactable: Interactable;
	listeners: string[] = [];
	private constructor(private readonly element: HTMLElement) {
		this.interactable = interact(element);
	}

	static from(element: HTMLElement): InteractBuilder {
		return new InteractBuilder(element);
	}

	resizable(resize: ResizeListener) {
		resizable(this.interactable, this.element, resize);
		this.listeners.push('resize');
		return this;
	}

	movable(move: MoveListener) {
		movable(this.interactable, this.element, move);
		this.listeners.push('move');
		return this;
	}

	on() {
		this.interactable.on(this.listeners);
		this.interactable.styleCursor(true);
	}

	off() {
		this.interactable.off(this.listeners);
		this.interactable.styleCursor(false);
	}

	unsubscribe() {
		this.interactable.unset();
	}
}

const resizable = (
	interactable: Interactable,
	element: HTMLElement,
	resized: ResizeListener
): Interactable => {
	return interactable.resizable({
		edges: { left: true, right: true, bottom: true, top: true },
		// 5 on desktop 10 on mobile
		margin: 5, // window padding in px is 3
		listeners: {
			move: (event: ResizeEvent) => {
				if (!event.target.classList.contains('immobile')) {
					resized({
						height: event.rect.height,
						width: event.rect.width,
						left: event.deltaRect?.left,
						top: event.deltaRect?.top,
					});
				}
			},
		},
		modifiers: [
			interact.modifiers.restrictSize({
				min: {
					width: 120, //element.scrollWidth,
					// 45: titlebar and menubar together
					height: 45, //element.scrollHeight,
				},
			}),
		],
	});
};
