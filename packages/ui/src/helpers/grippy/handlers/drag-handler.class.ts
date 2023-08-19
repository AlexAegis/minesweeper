import { cloneRectangle } from '../../movable-window.js';
import {
	Handler,
	normalizeHandlerOptions,
	type ElementActionContext,
	type HandlerOptions,
	type NormalizedHandlerOptions,
	type PointerEventActionContext,
} from './base-handler.class.js';
import { type Vec2 } from './vec2.interface.js';

export interface MoveData {
	target: Element;
	handle: Element;
	event: PointerEvent;
	/**
	 * From the previous event
	 */
	delta: Vec2;
	/**
	 * From the first event
	 */
	total: Vec2;
}

export interface DragHandlerOptions extends HandlerOptions {
	listeners?:
		| {
				moveBegin?: (data: MoveData) => void;
				move?: (data: MoveData) => void;
				moveEnd?: (data: MoveData) => void;
		  }
		| undefined;
	handleCursor?: string | undefined;
}

export type NormalizeDragHandlerOptions = DragHandlerOptions & NormalizedHandlerOptions;

export const normalizeDragHandlerOptions = (
	options: DragHandlerOptions,
): NormalizeDragHandlerOptions => {
	return {
		...normalizeHandlerOptions(options),
		listeners: options.listeners,
		handleCursor: options.handleCursor,
	};
};

export class DragHandler extends Handler<NormalizeDragHandlerOptions> {
	private actionContext: (PointerEventActionContext & ElementActionContext) | undefined;
	private originalCursorStyle = '';

	override initialize(): void {
		if (this.options.handleCursor) {
			this.originalCursorStyle = (this.options.handle as HTMLElement).style.cursor;
			(this.options.handle as HTMLElement).style.cursor = this.options.handleCursor;
		}
	}

	override destroy(): void {
		if (this.options.handleCursor) {
			(this.options.handle as HTMLElement).style.cursor = this.originalCursorStyle;
		}
	}

	begin(event: PointerEvent): void {
		this.actionContext = {
			pointerOrigin: {
				x: event.x,
				y: event.y,
			},
			lastPointerPositon: {
				x: event.x,
				y: event.y,
			},
			originalSize: cloneRectangle(this.options.target),
			initialEvent: event,
		};

		this.options.listeners?.moveBegin?.({
			handle: this.options.handle,
			target: this.options.target,
			event,
			delta: { x: 0, y: 0 },
			total: { x: 0, y: 0 },
		});
	}

	handle(event: PointerEvent): void {
		if (this.actionContext) {
			const position: Vec2 = {
				x: event.x,
				y: event.y,
			};
			const delta: Vec2 = {
				x: position.x - this.actionContext.lastPointerPositon.x,
				y: position.y - this.actionContext.lastPointerPositon.y,
			};

			const total: Vec2 = {
				x: position.x - this.actionContext.pointerOrigin.x,
				y: position.y - this.actionContext.pointerOrigin.y,
			};

			this.actionContext.lastPointerPositon.x = position.x;
			this.actionContext.lastPointerPositon.y = position.y;

			this.options.listeners?.move?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				delta,
				total,
			});
		}
	}

	end(event: PointerEvent): void {
		if (this.actionContext) {
			const position: Vec2 = {
				x: event.x,
				y: event.y,
			};
			const delta: Vec2 = {
				x: position.x - this.actionContext.lastPointerPositon.x,
				y: position.y - this.actionContext.lastPointerPositon.y,
			};

			const total: Vec2 = {
				x: position.x - this.actionContext.pointerOrigin.x,
				y: position.y - this.actionContext.pointerOrigin.y,
			};

			this.options.listeners?.moveEnd?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				delta,
				total,
			});
		}

		this.actionContext = undefined;
	}
}
