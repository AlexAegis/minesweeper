import { type Defined } from '@alexaegis/common';
import { substractRectangles, type Rectangle } from '../../../components/rectangle.interface.js';
import { checkStyleResult } from '../../movable-window.js';
import type { GrippyContainer } from '../grippy.js';
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
	event: Vec2,
	rectangle: Rectangle,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth'>,
	container: GrippyContainer,
): boolean => {
	const padding = (options.edgeInnerWidth + 1) * container.options.zoom;

	const horizontallyWithin = rectangle.x <= event.x && event.x <= rectangle.x + rectangle.width;
	const verticallyWithin = rectangle.y <= event.y && event.y <= rectangle.y + padding;

	return horizontallyWithin && verticallyWithin;
};

const isAtBottomEdge = (
	event: Vec2,
	rectangle: Rectangle,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth'>,
	container: GrippyContainer,
): boolean => {
	const padding = (options.edgeInnerWidth + 1) * container.options.zoom;

	const horizontallyWithin = rectangle.x <= event.x && event.x <= rectangle.x + rectangle.width;
	const verticallyWithin =
		rectangle.y + rectangle.height - padding <= event.y &&
		event.y <= rectangle.y + rectangle.height;

	return horizontallyWithin && verticallyWithin;
};

const isAtLeftEdge = (
	event: Vec2,
	rectangle: Rectangle,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth'>,
	container: GrippyContainer,
): boolean => {
	const padding = (options.edgeInnerWidth + 1) * container.options.zoom;
	const horizontallyWithin = rectangle.x <= event.x && event.x <= rectangle.x + padding;
	const verticallyWithin = rectangle.y <= event.y && event.y <= rectangle.y + rectangle.height;

	return horizontallyWithin && verticallyWithin;
};

const isAtRightEdge = (
	position: Vec2,
	rectangle: Rectangle,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth'>,
	container: GrippyContainer,
): boolean => {
	const padding = (options.edgeInnerWidth + 1) * container.options.zoom;
	const horizontallyWithin =
		rectangle.x + rectangle.width - padding <= position.x &&
		position.x <= rectangle.x + rectangle.width;
	const verticallyWithin =
		rectangle.y <= position.y && position.y <= rectangle.y + rectangle.height;

	return horizontallyWithin && verticallyWithin;
};

export type EdgeSegment = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const getEdgeSegment = (
	event: Vec2,
	rectangle: Rectangle,
	options: Pick<NormalizedResizeHandlerOptions, 'edgeInnerWidth' | 'enabledEdges'>,
	container: GrippyContainer,
): EdgeSegment | undefined => {
	const position: Vec2 = {
		x: event.x,
		y: event.y,
	};

	const w = isAtLeftEdge(position, rectangle, options, container);
	const e = isAtRightEdge(position, rectangle, options, container);
	const n = isAtTopEdge(position, rectangle, options, container);
	const s = isAtBottomEdge(position, rectangle, options, container);

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
	container: GrippyContainer,
): Rectangle => {
	snap(context.originalSize);

	let width = context.originalSize.width / container.options.zoom;
	let height = context.originalSize.height / container.options.zoom;
	let x = context.originalSize.x / container.options.zoom;
	let y = context.originalSize.y / container.options.zoom;

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
	const styleCheck = checkStyleResult(options.target as HTMLElement, resize);
	const after = container.zoomRectangle(styleCheck.after);
	if (context.western && width <= after.width) {
		const originalRight = context.originalSize.x + context.originalSize.width;

		resize.width = after.width;
		resize.x = originalRight - after.width;
		resize.x /= container.options.zoom;
		resize.width /= container.options.zoom;
	}

	if (context.northern && height <= after.height) {
		const originalBottom = context.originalSize.y + context.originalSize.height;

		resize.height = after.height;
		resize.y = originalBottom - after.height;
		resize.y /= container.options.zoom;
		resize.height /= container.options.zoom;
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
	private debugElement: HTMLCanvasElement | undefined;
	override preferredCursor(event: PointerEvent): string | undefined {
		if (this.actionContext) {
			return cursorMap[this.actionContext.initialEdge];
		} else {
			const rectangle = this.container.zoomRectangle(
				this.options.handle.getBoundingClientRect(),
			);

			const edgeSegment = getEdgeSegment(
				this.container.offsetWithContainer(event),
				rectangle,
				this.options,
				this.container,
			);
			return edgeSegment ? cursorMap[edgeSegment] : undefined;
		}
	}

	override initialize(): void {
		if (this.container.options.debug) {
			this.debugElement = this.createDebugElement();
		}
	}

	override everyMove(_pointerEvent: PointerEvent): void {
		if (this.debugElement) {
			this.updateDebugElementPosition(this.debugElement);
		}
	}

	private createDebugElement(): HTMLCanvasElement {
		const body = document.querySelector('body');
		const existingDebugElement = document.querySelector('#debugElement');
		if (existingDebugElement) {
			existingDebugElement.remove();
		}
		if (body) {
			const containerRect = this.container.getContainerRect();
			const debugElement = document.createElement('canvas');
			debugElement.id = 'debugElement';
			debugElement.style.pointerEvents = 'none';
			debugElement.style.opacity = '0.5';
			debugElement.style.backgroundColor = 'red';
			debugElement.style.display = 'block';
			debugElement.style.position = 'fixed';
			debugElement.style.zIndex = '999999';
			debugElement.style.left = containerRect.x + 'px';
			debugElement.style.top = containerRect.y + 'px';
			debugElement.style.width = body.offsetWidth.toString() + 'px';
			debugElement.style.height = body.offsetHeight.toString() + 'px';
			debugElement.width = body.offsetWidth;
			debugElement.height = body.offsetHeight;
			this.updateDebugElementPosition(debugElement);

			body.append(debugElement);
			return debugElement;
		} else {
			throw new Error('nobody is here');
		}
	}

	private updateDebugElementPosition(element: HTMLCanvasElement): void {
		const context = element.getContext('2d');
		const rectangle = this.container.zoomRectangle(this.options.handle.getBoundingClientRect());
		if (context) {
			context.clearRect(0, 0, element.width, element.height);

			context.fillStyle = 'rgb(10, 10, 250)';
			context.fillRect(10, 10, 20, 20);

			const resolution = 2;
			for (let x = rectangle.x; x < rectangle.x + rectangle.width; x += resolution) {
				for (let y = rectangle.y; y < rectangle.y + rectangle.height; y += resolution) {
					const vec: Vec2 = {
						x,
						y,
					};

					const edge = getEdgeSegment(
						vec,
						rectangle,
						{ edgeInnerWidth: 5 },
						this.container,
					);
					if (edge) {
						context.fillStyle = 'rgb(40, 220, 40)';
						context.fillRect(x, y, resolution, resolution);
					}
				}
			}
		}
	}

	begin(event: PointerEvent): void {
		const handleRect = this.container.zoomRectangle(
			this.options.handle.getBoundingClientRect(),
		);
		const targetRect = this.container.zoomRectangle(
			this.options.target.getBoundingClientRect(),
		);

		const edge = getEdgeSegment(
			this.container.offsetWithContainer(event),
			handleRect,
			this.options,
			this.container,
		);
		if (edge) {
			this.actionContext = {
				pointerOrigin: this.container.getEventPositionWithOffset(event),
				lastPointerPositon: this.container.getEventPositionWithOffset(event),
				originalSize: { ...targetRect },
				initialEvent: event,
				initialEdge: edge,
				xAxisLocked: !edgeMovesOnHorizontalAxis(edge),
				yAxisLocked: !edgeMovesOnVerticalAxis(edge),
				eastern: isEasternEdge(edge),
				northern: isNorthernEdge(edge),
				southern: isSouthernEdge(edge),
				western: isWesternEdge(edge),
				lastSize: { ...targetRect },
			};

			snap(this.actionContext.originalSize);
			snap(this.actionContext.lastSize);

			const cursor = calculateCursorData(event, this.actionContext, this.container);
			const axisLockedCursorData = axisLockCursorData(cursor, this.actionContext);
			const resize = calculateResizeData(
				cursor,
				this.actionContext,
				this.options,
				this.container,
			);

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
			const resize = calculateResizeData(
				cursor,
				this.actionContext,
				this.options,
				this.container,
			);

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
			const resize = calculateResizeData(
				cursor,
				this.actionContext,
				this.options,
				this.container,
			);

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
