import type { Defined } from '@alexaegis/common';
import type { Rectangle } from '../../components/rectangle.interface';
import type { Handler, NormalizedHandlerOptions } from './handlers/base-handler.class';
import {
	DragHandler,
	normalizeDragHandlerOptions,
	type DragHandlerOptions,
} from './handlers/drag-handler.class';
import {
	ResizeHandler,
	normalizeResizeHandlerOptions,
	type ResizeHandlerOptions,
	type Vec2,
} from './handlers/index.js';

export interface GrippyContainerOptions {
	/**
	 * This is where the cursor styling will go
	 *
	 * By default it's the body element
	 */
	rootElement?: HTMLElement;

	/**
	 * To counteract shifting positions when css zoom is applied to the container
	 * @example 1 is 100%, 2 is 200%
	 */
	zoom?: number;

	/**
	 * This is for enabling certain visual debugging features.
	 * Keep it turned off unless you know what you're using it for.
	 * @default false
	 */
	debug?: boolean;
}
export type NormalizedGrippyContainerOptions = Defined<GrippyContainerOptions>;

export const normalizeGrippyContainerOptions = (
	options?: GrippyContainerOptions,
): NormalizedGrippyContainerOptions => {
	return {
		rootElement: options?.rootElement ?? (document.querySelector('body') as HTMLElement),
		zoom: options?.zoom ?? 1,
		debug: options?.debug ?? false,
	};
};

export class GrippyContainer {
	public readonly options: NormalizedGrippyContainerOptions;

	private allHandlers = new Set<Handler>();
	private handlersByHandleElement = new Map<Element, Handler[]>();
	private activeHandlers: Handler[] = [];
	private container!: Element;
	private lastMoveTimestamp: number = performance.now();

	private readonly documentListeners: Record<string, (event: never) => void> = {
		pointerdown: (event: PointerEvent): void => {
			this.activateAffectedHandlers(event);
			for (const activeHandler of this.activeHandlers) {
				activeHandler.begin(event);
			}
		},
		pointermove: (event: PointerEvent): void => {
			const now = performance.now();
			for (const activeHandler of this.activeHandlers) {
				activeHandler.handle(event);
			}
			let cursor: string | undefined = undefined;

			const handlersUnder = this.getFirstElementsHandlersInEvent(event);
			if (handlersUnder) {
				for (const handler of handlersUnder) {
					cursor ??= handler.preferredCursor?.(event);
				}
			}

			if (now - this.lastMoveTimestamp >= 50) {
				for (const handler of this.allHandlers) {
					handler.everyMove?.(event);
				}
			}

			this.lastMoveTimestamp = now;
			this.options.rootElement.style.cursor = cursor ?? '';
		},
		pointerup: (event: PointerEvent): void => {
			for (const activeHandler of this.activeHandlers) {
				activeHandler.end(event);
			}
			this.deactivateAllActiveHandlers();
		},
	};

	constructor(rawOptions?: GrippyContainerOptions) {
		this.options = normalizeGrippyContainerOptions(rawOptions);
	}

	public getContainerRect(): Rectangle {
		const rectangle = this.container.getBoundingClientRect();

		return {
			height: rectangle.height * this.options.zoom,
			width: rectangle.width * this.options.zoom,
			x: rectangle.x * this.options.zoom,
			y: rectangle.y * this.options.zoom,
		};
	}

	public offsetWithContainer(vec: Vec2): Vec2 {
		const offset = this.getContainerRect();
		return {
			x: vec.x - offset.x,
			y: vec.y - offset.y,
		};
	}

	public getEventPositionWithOffset(event: PointerEvent): Vec2 {
		const offset = this.getContainerRect();

		return {
			x: (event.x - offset.x) / this.options.zoom,
			y: (event.y - offset.y) / this.options.zoom,
		};
	}

	public zoomRectangle(rectangle: Rectangle): Rectangle {
		const containerRectangle = this.container.getBoundingClientRect();

		return {
			height: rectangle.height * this.options.zoom,
			width: rectangle.width * this.options.zoom,
			x: (rectangle.x - containerRectangle.x) * this.options.zoom,
			y: (rectangle.y - containerRectangle.y) * this.options.zoom,
		};
	}

	private getFirstElementsHandlersInEvent(event: PointerEvent): Handler[] | undefined {
		let target = event.target as HTMLElement | undefined | null;
		while (target) {
			const handlers = this.handlersByHandleElement.get(target);
			if (handlers) {
				return handlers.filter((handler) => handler.enabled);
			}
			target = target.parentElement;
		}
		return undefined;
	}

	private activateAffectedHandlers(event: PointerEvent): void {
		const handlers = this.getFirstElementsHandlersInEvent(event);
		if (handlers) {
			for (const handler of handlers) {
				this.activeHandlers.push(handler);
			}
		}
	}

	deactivateAllActiveHandlers(): void {
		this.activeHandlers.length = 0;
	}

	initialize(container: Element): void {
		this.container = container;
		if (this.options.zoom) {
			(this.options.rootElement.style as unknown as { zoom: string }).zoom =
				this.options.zoom * 100 + '%';
		}

		for (const [type, listener] of Object.entries(this.documentListeners)) {
			document.addEventListener(type, listener as EventListener);
		}
	}

	public draggable(options: DragHandlerOptions): Handler {
		return this.registerHandler(DragHandler, normalizeDragHandlerOptions(options));
	}

	public resizable(options: ResizeHandlerOptions): Handler {
		return this.registerHandler(ResizeHandler, normalizeResizeHandlerOptions(options));
	}

	private registerHandler<O extends NormalizedHandlerOptions>(
		handlerType: new (g: GrippyContainer, options: O) => Handler,
		options: O,
	): Handler {
		let handlerInstance: Handler;
		const handlers = this.handlersByHandleElement.get(options.target) ?? [];
		const existingHandler = handlers.find((handler) => handler instanceof handlerType);

		if (existingHandler) {
			return existingHandler;
		} else {
			handlerInstance = new handlerType(this, options);
			handlers.push(handlerInstance);
			this.handlersByHandleElement.set(options.handle, handlers);
			this.allHandlers.add(handlerInstance);
			handlerInstance.initialize?.();
			return handlerInstance;
		}
	}

	/**
	 * Used by handlers when they unsubscribe
	 */
	public removeHandler(handler: Handler): void {
		const elementsHandlers = this.handlersByHandleElement.get(handler.options.target);
		if (elementsHandlers) {
			elementsHandlers.splice(elementsHandlers.indexOf(handler), 1);
			if (elementsHandlers.length === 0) {
				this.handlersByHandleElement.delete(handler.options.target);
				this.allHandlers.delete(handler);
				handler.destroy?.();
			}
		}
	}

	public unsubscribe(): void {
		for (const [type, listener] of Object.entries(this.documentListeners)) {
			document.removeEventListener(type, listener as EventListener);
		}
	}
}
