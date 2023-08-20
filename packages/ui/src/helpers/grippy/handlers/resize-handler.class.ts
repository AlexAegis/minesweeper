import { type Defined } from '@alexaegis/common';
import { substractRectangles, type Rectangle } from '../../../components/rectangle.interface.js';
import { checkStyleResult, cloneRectangle } from '../../movable-window.js';
import {
	Handler,
	normalizeHandlerOptions,
	type ElementActionContext,
	type HandlerOptions,
	type NormalizedHandlerOptions,
	type PointerEventActionContext,
} from './base-handler.class.js';
import {
	calculateCursorData,
	type CursorData,
	type DragHandlerData,
} from './drag-handler.class.js';
import type { Vec2 } from './vec2.interface.js';

export interface ResizeHandlerData extends DragHandlerData {
	resize: Rectangle;
	resizeDelta: Rectangle;
	resizeTotalDelta: Rectangle;
	axisLockedCursorData: CursorData;
}

export interface ResizeHandlerOptions extends HandlerOptions {
	listeners?:
		| {
				resizeBegin?: (data: ResizeHandlerData) => void;
				resize?: (data: ResizeHandlerData) => void;
				resizeEnd?: (data: ResizeHandlerData) => void;
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

const isWesternEdge = (edge: EdgeSegment): boolean => {
	return edge.includes('w');
};

const isEasternEdge = (edge: EdgeSegment): boolean => {
	return edge.includes('e');
};

const isNorthernEdge = (edge: EdgeSegment): boolean => {
	return edge.includes('n');
};

const isSouthernEdge = (edge: EdgeSegment): boolean => {
	return edge.includes('s');
};

const edgeMovesOnHorizontalAxis = (edge: EdgeSegment): boolean => {
	return isEasternEdge(edge) || isWesternEdge(edge);
};

const edgeMovesOnVerticalAxis = (edge: EdgeSegment): boolean => {
	return isNorthernEdge(edge) || isSouthernEdge(edge);
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

export interface AxisLockContext {
	xAxisLocked: boolean;
	yAxisLocked: boolean;
}

const dropLockedAxes = (vec: Vec2, options: AxisLockContext): Vec2 => {
	return {
		x: options.xAxisLocked ? 0 : vec.x,
		y: options.yAxisLocked ? 0 : vec.y,
	};
};

const axisLockCursorData = (cursorData: CursorData, options: AxisLockContext): CursorData => {
	return {
		client: dropLockedAxes(cursorData.client, options),
		delta: dropLockedAxes(cursorData.delta, options),
		total: dropLockedAxes(cursorData.total, options),
		origin: cursorData.origin,
	};
};

const snap = <T extends Partial<Rectangle>>(resize: T): T => {
	if (resize.height !== undefined) {
		resize.height = Math.floor(resize.height);
	}
	if (resize.width !== undefined) {
		resize.width = Math.floor(resize.width);
	}
	if (resize.x !== undefined) {
		resize.x = Math.ceil(resize.x);
	}
	if (resize.y !== undefined) {
		resize.y = Math.ceil(resize.y);
	}

	return resize;
};

const calculateResizeData = (
	cursorData: CursorData,
	context: ResizeActionContext,
	options: { target: Element },
): Rectangle => {
	let width = context.originalSize.width;
	let height = context.originalSize.height;
	let x = context.originalSize.x;
	let y = context.originalSize.y;

	if (context.eastern) {
		width += cursorData.total.x;
	}

	if (context.western) {
		x += cursorData.total.x;
		width -= cursorData.total.x;
	}

	if (context.southern) {
		height += cursorData.total.y;
	}

	if (context.northern) {
		y += cursorData.total.y;
		height -= cursorData.total.y;
	}

	const resize: Rectangle = {
		width,
		height,
		x,
		y,
	};

	snap(resize);

	// Verify
	const { after } = checkStyleResult(options.target as HTMLElement, resize);

	if (context.western && width <= after.width) {
		const originalRight = context.originalSize.x + context.originalSize.width;

		resize.width = after.width;
		resize.x = originalRight - after.width;
	}

	if (context.northern && height <= after.height) {
		const originalBottom = context.originalSize.y + context.originalSize.height;

		resize.height = after.height;
		resize.y = originalBottom - after.height;
	}

	snap(resize);
	return resize;
};

interface EdgeContext {
	initialEdge: EdgeSegment;
	eastern: boolean;
	western: boolean;
	northern: boolean;
	southern: boolean;
}

type ResizeActionContext = PointerEventActionContext &
	ElementActionContext &
	AxisLockContext &
	EdgeContext & {
		lastSize: Rectangle;
	};

export class ResizeHandler extends Handler<NormalizedResizeHandlerOptions> {
	private actionContext: ResizeActionContext | undefined;

	override preferredCursor(event: PointerEvent): string | undefined {
		if (this.actionContext) {
			return cursorMap[this.actionContext.initialEdge];
		} else {
			const rectangle = this.options.handle.getBoundingClientRect();
			const edgeSegment = getEdgeSegment(event, rectangle, this.options);
			return edgeSegment ? cursorMap[edgeSegment] : undefined;
		}
	}

	begin(event: PointerEvent): void {
		this.container.getContainerRect();
		const edge = getEdgeSegment(
			event,
			this.options.handle.getBoundingClientRect(),
			this.options,
		);
		if (edge) {
			this.actionContext = {
				pointerOrigin: this.container.offsetWithContainer({
					x: event.x,
					y: event.y,
				}),
				lastPointerPositon: this.container.offsetWithContainer({
					x: event.x,
					y: event.y,
				}),
				originalSize: this.container.offsetWithContainer(
					cloneRectangle(this.options.target, true),
				),
				initialEvent: event,
				initialEdge: edge,
				xAxisLocked: !edgeMovesOnHorizontalAxis(edge),
				yAxisLocked: !edgeMovesOnVerticalAxis(edge),
				eastern: isEasternEdge(edge),
				northern: isNorthernEdge(edge),
				southern: isSouthernEdge(edge),
				western: isWesternEdge(edge),
				lastSize: cloneRectangle(this.options.target, true),
			};

			snap(this.actionContext.originalSize);
			snap(this.actionContext.lastSize);

			const cursor = calculateCursorData(event, this.actionContext, this.container);
			const axisLockedCursorData = axisLockCursorData(cursor, this.actionContext);
			const resize = calculateResizeData(cursor, this.actionContext, this.options);

			this.options.listeners?.resizeBegin?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				cursor,
				axisLockedCursorData,
				resize,
				resizeDelta: substractRectangles(this.actionContext.lastSize, resize),
				resizeTotalDelta: substractRectangles(this.actionContext.originalSize, resize),
			});
		}
	}

	handle(event: PointerEvent): void {
		if (this.actionContext) {
			const cursor = calculateCursorData(event, this.actionContext, this.container);
			const axisLockedCursorData = axisLockCursorData(cursor, this.actionContext);
			const resize = calculateResizeData(cursor, this.actionContext, this.options);

			this.options.listeners?.resize?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				cursor,
				axisLockedCursorData,
				resize,
				resizeDelta: substractRectangles(this.actionContext.lastSize, resize),
				resizeTotalDelta: substractRectangles(this.actionContext.originalSize, resize),
			});

			this.actionContext.lastPointerPositon = cursor.client;
			this.actionContext.lastSize = resize;
		}
	}

	end(event: PointerEvent): void {
		if (this.actionContext) {
			const cursor = calculateCursorData(event, this.actionContext, this.container);
			const axisLockedCursorData = axisLockCursorData(cursor, this.actionContext);
			const resize = calculateResizeData(cursor, this.actionContext, this.options);

			this.options.listeners?.resizeEnd?.({
				handle: this.options.handle,
				target: this.options.target,
				event,
				cursor,
				axisLockedCursorData,
				resize,
				resizeDelta: substractRectangles(this.actionContext.lastSize, resize),
				resizeTotalDelta: substractRectangles(this.actionContext.originalSize, resize),
			});

			this.actionContext.lastPointerPositon = cursor.client;
			this.actionContext.lastSize = resize;
		}

		this.actionContext = undefined;
	}
}
