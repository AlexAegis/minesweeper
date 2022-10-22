import type { Interactable, ResizeEvent } from '@interactjs/types';
import interact from 'interactjs';
import { movable, type MoveListener } from './movable.function';

export interface ResizeData {
	height: number | undefined;
	width: number | undefined;
	moveX: number | undefined;
	moveY: number | undefined;
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
		margin: 7, // window padding in px is 3
		listeners: {
			move: (event: ResizeEvent) => {
				if (!event.target.classList.contains('immobile')) {
					const originalWidthStyle = element.style.width;
					const originalHeightStyle = element.style.height;

					const originalWidth = element.offsetWidth;
					const originalHeight = element.offsetHeight;

					const targetWidth = Math.round(event.rect.width);
					const targetHeight = Math.round(event.rect.height);

					element.style.width = targetWidth + 'px';
					const nextWidth = element.offsetWidth;

					const widthChanged = originalWidth !== nextWidth;
					element.style.width = originalWidthStyle;

					element.style.height = targetHeight + 'px';
					const nextHeight = element.offsetHeight;
					const heightChanged = originalHeight !== nextHeight;
					element.style.height = originalHeightStyle;

					const left = event.deltaRect?.left ?? 0;
					const top = event.deltaRect?.top ?? 0;

					const maxPossibleWidthChange = originalWidth - nextWidth;
					const maxPossibleHeightChange = originalHeight - nextHeight;

					const moveX =
						maxPossibleWidthChange > 0
							? Math.min(maxPossibleWidthChange, left)
							: Math.max(maxPossibleWidthChange, left);
					const moveY =
						maxPossibleHeightChange > 0
							? Math.min(maxPossibleHeightChange, top)
							: Math.max(maxPossibleHeightChange, top);

					resized({
						height: heightChanged ? targetHeight : undefined,
						width: widthChanged ? targetWidth : undefined,
						moveY,
						moveX,
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
			interact.modifiers.snap({
				targets: [
					interact.createSnapGrid({
						x: 1,
						y: 1,
					}),
				],
				range: Infinity,
			}),
		],
	});
};
