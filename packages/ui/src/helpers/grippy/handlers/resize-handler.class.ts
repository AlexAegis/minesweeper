import type { Defined } from '@alexaegis/common';
import { cloneRectangle } from '../../movable-window.js';
import {
	Handler,
	normalizeHandlerOptions,
	type ElementActionContext,
	type HandlerOptions,
	type NormalizedHandlerOptions,
	type PointerEventActionContext,
} from './base-handler.class.js';
import type { MoveData } from './drag-handler.class.js';
import type { Vec2 } from './vec2.interface.js';

export interface ResizeData extends MoveData {
	width: number;
	height: number;
}

export interface ResizeHandlerOptions extends HandlerOptions {
	listeners?:
		| {
				resizeBegin?: (data: ResizeData) => void;
				resize?: (data: ResizeData) => void;
				resizeEnd?: (data: ResizeData) => void;
		  }
		| undefined;
	/**
	 * In pixels, how much deep the interactive edge should go inside the handle element
	 *
	 * @default 0
	 */
	edgeInnerWidth?: number | undefined;

	/**
	 * What edge segments will be enabled, by default it's all of them.
	 */
	enabledEdges?: Record<EdgeSegment, boolean> | undefined;
}

export type NormalizedResizeHandlerOptions = Defined<Pick<ResizeHandlerOptions, 'edgeInnerWidth'>> &
	Omit<ResizeHandlerOptions, 'edgeInnerWidth'> &
	NormalizedHandlerOptions;

export const normalizeResizeHandlerOptions = (
	options: ResizeHandlerOptions,
): NormalizedResizeHandlerOptions => {
	return {
		...normalizeHandlerOptions(options),
		listeners: options.listeners,
		edgeInnerWidth: options.edgeInnerWidth ?? 0,
		enabledEdges: options.enabledEdges,
	};
};

const isAtTopEdge = (
	event: PointerEvent,
	rectangle: DOMRect,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth'>,
): boolean => {
	const horizontallyWithin =
		rectangle.x <= event.clientX && event.clientX <= rectangle.x + rectangle.width;
	const verticallyWithin =
		rectangle.y <= event.clientY && event.clientY <= rectangle.y + options.edgeInnerWidth + 1;

	return horizontallyWithin && verticallyWithin;
};

const isAtBottomEdge = (
	event: PointerEvent,
	rectangle: DOMRect,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth'>,
): boolean => {
	const horizontallyWithin =
		rectangle.x <= event.clientX && event.clientX <= rectangle.x + rectangle.width;
	const verticallyWithin =
		rectangle.y + rectangle.height - (options.edgeInnerWidth + 1) <= event.clientY &&
		event.clientY <= rectangle.y + rectangle.height;

	return horizontallyWithin && verticallyWithin;
};

const isAtLeftEdge = (
	event: PointerEvent,
	rectangle: DOMRect,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth'>,
): boolean => {
	const horizontallyWithin =
		rectangle.x <= event.clientX && event.clientX <= rectangle.x + options.edgeInnerWidth + 1;
	const verticallyWithin =
		rectangle.y <= event.clientY && event.clientY <= rectangle.y + rectangle.height;

	return horizontallyWithin && verticallyWithin;
};

const isAtRightEdge = (
	event: PointerEvent,
	rectangle: DOMRect,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth'>,
): boolean => {
	const horizontallyWithin =
		rectangle.x + rectangle.width - (options.edgeInnerWidth + 1) <= event.clientX &&
		event.clientX <= rectangle.x + rectangle.width;
	const verticallyWithin =
		rectangle.y <= event.clientY && event.clientY <= rectangle.y + rectangle.height;

	return horizontallyWithin && verticallyWithin;
};

export type EdgeSegment = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const getEdgeSegment = (
	event: PointerEvent,
	rectangle: DOMRect,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth' | 'enabledEdges'>,
): EdgeSegment | undefined => {
	const w = isAtLeftEdge(event, rectangle, options);
	const e = isAtRightEdge(event, rectangle, options);
	const n = isAtTopEdge(event, rectangle, options);
	const s = isAtBottomEdge(event, rectangle, options);

	if (n && w && options.enabledEdges?.nw !== false) {
		return 'nw';
	} else if (n && e && options.enabledEdges?.ne !== false) {
		return 'ne';
	} else if (s && w && options.enabledEdges?.sw !== false) {
		return 'sw';
	} else if (s && e && options.enabledEdges?.se !== false) {
		return 'se';
	} else if (w && options.enabledEdges?.w !== false) {
		return 'w';
	} else if (e && options.enabledEdges?.e !== false) {
		return 'e';
	} else if (n && options.enabledEdges?.n !== false) {
		return 'n';
	} else if (s && options.enabledEdges?.s !== false) {
		return 's';
	} else {
		return undefined;
	}
};

const cursorMap: Record<EdgeSegment, string> = {
	e: 'ew-resize',
	n: 'ns-resize',
	ne: 'nesw-resize',
	nw: 'nwse-resize',
	s: 'ns-resize',
	se: 'nwse-resize',
	sw: 'nesw-resize',
	w: 'ew-resize',
};

export class ResizeHandler extends Handler<NormalizedResizeHandlerOptions> {
	private actionContext:
		| (PointerEventActionContext & ElementActionContext & { initialEdge: EdgeSegment })
		| undefined;

	override preferredCursor(event: PointerEvent): string | undefined {
		const rectangle = this.options.handle.getBoundingClientRect();
		const edgeSegment = getEdgeSegment(event, rectangle, this.options);
		return edgeSegment ? cursorMap[edgeSegment] : undefined;
	}

	begin(event: PointerEvent): void {
		const edge = getEdgeSegment(
			event,
			this.options.handle.getBoundingClientRect(),
			this.options,
		);
		if (edge) {
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
				initialEdge: edge,
			};

			this.options.listeners?.resizeBegin?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				delta: { x: 0, y: 0 },
				total: { x: 0, y: 0 },
				height: this.actionContext.originalSize.height,
				width: this.actionContext.originalSize.width,
			});
		}
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

			this.options.listeners?.resize?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				delta,
				total,
				height: this.actionContext.originalSize.height,
				width: this.actionContext.originalSize.width,
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

			this.options.listeners?.resizeEnd?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				delta,
				total,
				height: this.actionContext.originalSize.height,
				width: this.actionContext.originalSize.width,
			});
		}

		this.actionContext = undefined;
	}
}
