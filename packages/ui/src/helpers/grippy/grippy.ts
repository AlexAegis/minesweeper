import type { Defined } from '@alexaegis/common';
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
	private readonly options: NormalizedGrippyContainerOptions;

	private allHandlers = new Set<Handler>();
	private handlersByHandleElement = new Map<Element, Handler[]>();
	private activeHandlers: Handler[] = [];
	private container!: Element;

	private readonly documentListeners: Record<string, (event: never) => void> = {
		pointerdown: (event: PointerEvent): void => {
			this.activateAffectedHandlers(event);
			for (const activeHandler of this.activeHandlers) {
				activeHandler.begin(event);
			}
		},
		pointermove: (event: PointerEvent): void => {
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

	public getContainerRect(): DOMRect {
		return this.container.getBoundingClientRect();
	}

	public offsetWithContainer<T extends Vec2>(vec: T): T {
		const offset = this.getContainerRect();
		vec.x -= offset.x;
		vec.y -= offset.y;
		return vec;
	}

	public getEventPositionWithOffset(event: PointerEvent): Vec2 {
		const offset = this.getContainerRect();

		return {
			x: event.x - offset.x,
			y: event.y - offset.y,
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
