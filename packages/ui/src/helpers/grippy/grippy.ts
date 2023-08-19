import type { Defined } from '@alexaegis/common';
import type { Handler, NormalizedHandlerOptions } from './handlers/base-handler.class';
import {
	DragHandler,
	normalizeDragHandlerOptions,
	type DragHandlerOptions,
} from './handlers/drag-handler.class';
import {
	ResizeHandler,
	isWithinRectangle,
	normalizeResizeHandlerOptions,
	type ResizeHandlerOptions,
} from './handlers/index.js';

export interface GrippyContainerOptions {
	/**
	 * This is where the cursor styling will go
	 *
	 * By default it's the body element
	 */
	rootElement?: HTMLElement;
}
export type NormalizedGrippyContainerOptions = Defined<GrippyContainerOptions>;

export const normalizeGrippyContainerOptions = (
	options?: GrippyContainerOptions,
): NormalizedGrippyContainerOptions => {
	return {
		rootElement: options?.rootElement ?? (document.querySelector('body') as HTMLElement),
	};
};

export class GrippyContainer {
	private readonly container: Element;
	private readonly options: NormalizedGrippyContainerOptions;

	private containerResizeObserver?: ResizeObserver;

	private debugLayer?: HTMLDivElement;

	private allHandlers = new Set<Handler>();
	private handlersByHandleElement = new Map<Element, Handler[]>();
	private activeHandlers: Handler[] = [];
	private lastPointerEvent!: PointerEvent;

	private readonly documentListeners: Record<string, (event: never) => void> = {
		pointerdown: (pointerEvent: PointerEvent): void => {
			console.log('asd');
			this.activateAffectedHandlers(pointerEvent);
			for (const activeHandler of this.activeHandlers) {
				activeHandler.begin(pointerEvent);
			}
			this.lastPointerEvent = pointerEvent;
		},
		pointermove: (pointerEvent: PointerEvent): void => {
			for (const activeHandler of this.activeHandlers) {
				activeHandler.handle(pointerEvent);
			}
			let cursor: string | undefined = undefined;
			for (const handler of this.allHandlers) {
				cursor ??= handler.preferredCursor?.(pointerEvent);
			}

			this.options.rootElement.style.cursor = cursor ?? '';

			this.lastPointerEvent = pointerEvent;
		},
		pointerup: (pointerEvent: PointerEvent): void => {
			for (const activeHandler of this.activeHandlers) {
				activeHandler.end(pointerEvent);
			}
			this.deactivateAllActiveHandlers();
			this.lastPointerEvent = pointerEvent;
		},
	};

	constructor(container: Element, rawOptions?: GrippyContainerOptions) {
		this.container = container;
		this.options = normalizeGrippyContainerOptions(rawOptions);
	}

	private activateAffectedHandlers(event: PointerEvent): void {
		for (const [key, handlers] of this.handlersByHandleElement) {
			if (isWithinRectangle(key.getBoundingClientRect(), event)) {
				this.activeHandlers.push(...handlers);
			}
		}
	}

	deactivateAllActiveHandlers(): void {
		this.activeHandlers.length = 0;
	}

	initialize(): void {
		this.containerResizeObserver = new ResizeObserver((e) => {
			console.log('oncontainerResize', e);
		});
		this.containerResizeObserver.observe(this.container);

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
		this.containerResizeObserver?.disconnect();

		for (const [type, listener] of Object.entries(this.documentListeners)) {
			this.container.removeEventListener(type, listener as EventListener);
		}
	}
}
