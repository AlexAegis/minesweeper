import type { GrippyContainer } from '../grippy.js';
import {
	Handler,
	normalizeHandlerOptions,
	type ElementActionContext,
	type HandlerOptions,
	type NormalizedHandlerOptions,
	type PointerEventActionContext,
} from './base-handler.class.js';
import { type Vec2 } from './vec2.interface.js';

export interface BaseGrippyEventData {
	target: Element;
	handle: Element;
	event: PointerEvent;
}

export interface CursorData {
	/**
	 * From the previous event
	 */
	delta: Vec2;

	/**
	 * From the first event
	 */
	total: Vec2;

	/**
	 * Where is the cursor now
	 */
	client: Vec2;

	/**
	 * Where was the first event
	 */
	origin: Vec2;
}

export type DragHandlerData = BaseGrippyEventData & { cursor: CursorData };

export interface DragHandlerOptions extends HandlerOptions {
	listeners?:
		| {
				moveBegin?: (data: DragHandlerData) => void;
				move?: (data: DragHandlerData) => void;
				moveEnd?: (data: DragHandlerData) => void;
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

export const calculateCursorData = (
	event: PointerEvent,
	context: PointerEventActionContext,
	container: GrippyContainer,
): CursorData => {
	const client: Vec2 = container.getEventPositionWithOffset(event);

	const delta: Vec2 = {
		x: client.x - context.lastPointerPositon.x,
		y: client.y - context.lastPointerPositon.y,
	};

	const total: Vec2 = {
		x: client.x - context.pointerOrigin.x,
		y: client.y - context.pointerOrigin.y,
	};

	return {
		client,
		delta,
		total,
		origin: { ...context.pointerOrigin },
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
			pointerOrigin: this.container.getEventPositionWithOffset(event),
			lastPointerPositon: this.container.getEventPositionWithOffset(event),
			originalSize: this.container.zoomRectangle(this.options.target.getBoundingClientRect()),
			initialEvent: event,
		};

		this.options.listeners?.moveBegin?.({
			handle: this.options.handle,
			target: this.options.target,
			event,
			cursor: calculateCursorData(event, this.actionContext, this.container),
		});
	}

	handle(event: PointerEvent): void {
		if (this.actionContext) {
			const cursor = calculateCursorData(event, this.actionContext, this.container);
			this.options.listeners?.move?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				cursor,
			});

			this.actionContext.lastPointerPositon = cursor.client;
		}
	}

	end(event: PointerEvent): void {
		if (this.actionContext) {
			this.options.listeners?.moveEnd?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				cursor: calculateCursorData(event, this.actionContext, this.container),
			});
		}

		this.actionContext = undefined;
	}
}
