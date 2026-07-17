<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import {
		Subject,
		Subscription,
		concat,
		filter,
		interval,
		map,
		of,
		startWith,
		switchMap,
		take,
		tap,
	} from 'rxjs';
	import { onDestroy, onMount, type Snippet } from 'svelte';

	import { sleep } from '@alexaegis/common';
	import { documentPointerDown$ } from '@w2k/core';
	import { ContextMenu } from '../components';
	import { afterNextPaint, readGlobal, type Handler } from '../helpers';
	import type { GrippyContainer } from '../helpers/grippy/grippy';
	import { formatPid, getWorkspaceRectangle, resizeWindow } from '../store';
	import type { Rectangle } from './rectangle.interface';
	import { formatAnimationVariables, type TaskBarAnimationFrame } from './taskbar-animation';
	import TitleBar from './title-bar.svelte';
	import { initialWindowState, type BaseWindowState } from './window-state.interface';

	interface Props {
		windowElement?: HTMLElement | undefined;
		grippy?: GrippyContainer | undefined;
		windowState?: Partial<BaseWindowState> | undefined;
		transient?: boolean;
		canDeactivate?: boolean;
		id?: string | undefined;
		class?: string | undefined;
		style?: string | undefined;
		onActivate?: (() => void) | undefined;
		onResize?: ((next: Rectangle) => void) | undefined;
		onMove?: ((delta: CoordinateLike) => void) | undefined;
		onMinimize?: (() => void) | undefined;
		onMaximize?: (() => void) | undefined;
		onRestore?: (() => void) | undefined;
		onClose?: (() => void) | undefined;
		onMaximizeAnimationEnd?: ((stage: 'maximizing' | 'restoring') => void) | undefined;
		children?: Snippet;
		menu?: Snippet;
		statusBar?: Snippet;
		titleBarContextMenu?: Snippet;
	}

	let {
		windowElement = $bindable(undefined),
		grippy = undefined,
		windowState = $bindable(undefined),
		transient = false,
		canDeactivate = true,
		id = undefined,
		class: className = '',
		style = '',
		onActivate = undefined,
		onResize = undefined,
		onMove = undefined,
		onMinimize = undefined,
		onMaximize = undefined,
		onRestore = undefined,
		onClose = undefined,
		onMaximizeAnimationEnd = undefined,
		children = undefined,
		menu = undefined,
		statusBar = undefined,
		titleBarContextMenu = undefined,
	}: Props = $props();

	let transientState = $derived({
		...initialWindowState,
		...windowState,
	});

	let effectiveResizable = $derived(transientState.resizable && !transientState.maximized);
	let effectiveMovable = $derived(!transientState.maximized);

	$effect(() => {
		resizeHandler?.setEnabled(effectiveResizable);
	});

	$effect(() => {
		dragHandler?.setEnabled(effectiveMovable);
	});

	const sink = new Subscription();

	function activate() {
		if (!transientState.active) {
			onActivate?.();
			if (transient) {
				transientState = { ...transientState, active: true };
			}
		}
	}

	function deactivate() {
		if (transient && transientState.active && canDeactivate) {
			transientState = { ...transientState, active: false };
		}
	}

	function resize(next: Rectangle) {
		onResize?.(next);
		if (transient) {
			transientState = resizeWindow(transientState, next);
		}
	}

	function move(delta: CoordinateLike) {
		onMove?.(delta);
		if (transient) {
			transientState = {
				...transientState,
				position: {
					...transientState.position,
					x: transientState.position.x + delta.x,
					y: transientState.position.y + delta.y,
				},
			};
		}
	}

	function minimize() {
		onMinimize?.();
	}

	function restore() {
		if (transientState.resizable) {
			onRestore?.();
			if (transient) {
				transientState = { ...transientState, maximized: false };
			}
		}
	}

	function maximize() {
		if (transientState.resizable) {
			onMaximize?.();
			if (transient) {
				transientState = { ...transientState, maximized: true };
			}
		}
	}

	function close() {
		onClose?.();
	}

	let contextMenuPosition: CoordinateLike | undefined = $state(undefined);

	// svelte-ignore state_referenced_locally
	if (transient) {
		// Transient means it's not managed by the store. So it has to deactivate itself.
		// This is counteracted by the error flash that can activate it back after the
		// flashing is over
		sink.add(
			documentPointerDown$
				.pipe(
					filter((event) => {
						const elementsUnderPointer = document.elementsFromPoint(
							event.pageX,
							event.pageY,
						);
						return !windowElement || !elementsUnderPointer.includes(windowElement);
					}),
					tap(() => {
						deactivate();
					}),
				)
				.subscribe(),
		);
	}

	export const errorNotification = new Subject<void>();

	export const errorFlash$ = errorNotification.pipe(
		switchMap(() =>
			concat(
				of(false),
				interval(66).pipe(
					take(6),
					map((_, i) => i % 2 === 0),
				),
				of(undefined),
			),
		),
		tap(() => {
			if (transient) {
				activate();
			}
		}),
		startWith(undefined),
	);

	let errorFlash = $derived($errorFlash$);

	let dragHandler: Handler | undefined = $state(undefined);
	let resizeHandler: Handler | undefined = $state(undefined);

	onMount(async () => {
		await sleep(0);

		const windowPlane = document.querySelector<HTMLElement>('#window-plane');
		if (windowElement && windowPlane && grippy) {
			const titleBar = windowElement.querySelectorAll('.title-bar').item(0);

			dragHandler = grippy.draggable({
				target: windowElement,
				handle: titleBar,
				listeners: {
					move: (data) => {
						move(data.cursor.delta);
					},
				},
			});

			resizeHandler = grippy.resizable({
				target: windowElement,
				listeners: {
					resize: (data) => {
						resize(data.resize);
					},
				},
				edgeInnerWidth: 3,
			});
			// Update size on render
			if (windowState) {
				if (transient) {
					windowState.width = windowElement.scrollWidth;
					windowState.height = windowElement.scrollHeight;
				} else {
					onResize?.({
						height: windowElement.scrollHeight,
						width: windowElement.scrollWidth,
					} as Rectangle);
				}
			}
		}
	});

	onDestroy(() => {
		sink.unsubscribe();
		dragHandler?.unsubscribe();
		resizeHandler?.unsubscribe();
	});

	// The windowed-mode title bar frame captured when maximizing starts. While
	// restoring, the css still shows the window at full size, so this is the
	// only exact source for where the restore animation has to land. The window
	// cannot move or resize while maximized, so the cached frame stays valid.
	let lastWindowedTitleBarFrame: TaskBarAnimationFrame | undefined;

	const getMaximizeAnimation = (
		windowState: BaseWindowState,
		stage: 'maximizing' | 'restoring',
	): string | undefined => {
		const windowId = formatPid(windowState.processId, 'window');

		const workspaceRect = getWorkspaceRectangle();
		const windowElement = document.querySelector(`#${windowId}`);
		const titleBarElement = windowElement?.querySelector('.title-bar');

		if (!workspaceRect || !windowElement || !titleBarElement) {
			return undefined;
		}

		// Rects are in screen pixels, but the animated title bar's fixed
		// left/top are in local pixels inside the zoomed desktop.
		const zoom = readGlobal('w2kZoom') || 1;
		const windowRect = windowElement.getBoundingClientRect();
		const titleBarRect = titleBarElement.getBoundingClientRect();

		// The window chrome between the window edge and its title bar
		const insetX = (titleBarRect.x - windowRect.x) / zoom;
		const insetY = (titleBarRect.y - windowRect.y) / zoom;

		if (stage === 'maximizing') {
			lastWindowedTitleBarFrame = {
				x: titleBarRect.x / zoom,
				y: titleBarRect.y / zoom,
				width: titleBarRect.width / zoom,
			};
		}

		const windowedOffset: TaskBarAnimationFrame = lastWindowedTitleBarFrame ?? {
			x: workspaceRect.x / zoom + windowState.position.x + insetX,
			y: workspaceRect.y / zoom + windowState.position.y + insetY,
			width: windowState.width - 2 * insetX,
		};

		const maximizedOffset: TaskBarAnimationFrame = {
			x: workspaceRect.x / zoom + insetX,
			y: workspaceRect.y / zoom + insetY,
			width: workspaceRect.width / zoom - 2 * insetX,
		};

		const fromOffset = stage === 'restoring' ? maximizedOffset : windowedOffset;
		const toOffset = stage === 'maximizing' ? maximizedOffset : windowedOffset;

		return formatAnimationVariables(fromOffset, toOffset);
	};
</script>

{#if transientState.maximized === 'maximizing' || transientState.maximized === 'restoring'}
	<TitleBar
		class="animate"
		windowState={{
			...transientState,
			showMaximize: false,
			showMinimize: false,
			showHelp: false,
			showClose: false,
		}}
		style={getMaximizeAnimation(transientState, transientState.maximized)}
		onanimationend={(event) => {
			// The flight itself completes the transition; the store timer is
			// only a fallback for when this event never fires. The fill-mode
			// hold gets to paint the exact end pose before the bar unmounts.
			const stage = transientState.maximized;
			if (
				event.animationName.includes('animate-titlebar') &&
				(stage === 'maximizing' || stage === 'restoring')
			) {
				afterNextPaint(() => {
					onMaximizeAnimationEnd?.(stage);
				});
			}
		}}
	/>
{/if}

<div
	bind:this={windowElement}
	{id}
	class="program-window window pid{transientState.processId} {transientState.program} {className}"
	{style}
	class:invisible={transientState.invisible}
	class:immobile={!effectiveMovable}
	class:non-resizable={!effectiveResizable}
	class:minimized={transientState.minimized === true}
	class:minimizing={transientState.minimized === 'minimizing'}
	class:unminimizing={transientState.minimized === 'unminimizing'}
	class:maximized={transientState.maximized === true}
	class:maximizing={transientState.maximized === 'maximizing'}
	class:restoring={transientState.maximized === 'restoring'}
	class:fit-content={transientState.fitContent}
	class:active={transientState.active}
	style:top={`${transientState.position.y.toString()}px`}
	style:left={`${transientState.position.x.toString()}px`}
	style:height={`${transientState.height.toString()}px`}
	style:width={`${transientState.width.toString()}px`}
	style:z-index={transientState.zIndex}
	role="dialog"
	tabindex="-1"
	onpointerdown={activate}
>
	<TitleBar
		windowState={{
			...transientState,
			active: ((errorFlash === undefined && transientState.active) || errorFlash) ?? false,
		}}
		onMinimize={minimize}
		onRestore={restore}
		onMaximize={maximize}
		onClose={close}
		oncontextmenu={(event) => {
			contextMenuPosition = contextMenuPosition
				? undefined
				: {
						x: event.pageX / readGlobal('w2kZoom'),
						y: event.pageY / readGlobal('w2kZoom'),
					};
		}}
	>
		<ContextMenu bind:position={contextMenuPosition}>
			{@render titleBarContextMenu?.()}
		</ContextMenu>
	</TitleBar>

	{#if menu}
		<div class="menu">
			{@render menu()}
		</div>
	{/if}

	<div class="window-body">
		{@render children?.()}
	</div>

	{#if statusBar}
		<div class="status-bar">
			{@render statusBar()}
		</div>
	{/if}
</div>

<style lang="scss">
	.program-window {
		position: relative;
		box-sizing: border-box;
		user-select: none;
		touch-action: none;

		&.minimizing,
		&.unminimizing,
		&.minimized {
			//	display: none !important;
			visibility: hidden !important;
		}

		.window-body {
			overflow: auto;
			margin: 0;
		}

		&.fit-content {
			display: table;
		}

		&:not(.fit-content) {
			display: flex;
			flex-direction: column;

			.window-body {
				height: 100%;
			}
		}

		.menu {
			min-height: 20px;
			display: flex;

			:global(button::first-letter) {
				text-transform: uppercase;
			}
		}

		&.maximized,
		&.restoring {
			height: 100% !important;
			width: 100% !important;
			top: 0 !important;
			left: 0 !important;
			transform: none !important;
		}

		&:not(.maximized) {
			height: fit-content;
			width: fit-content;
			min-width: fit-content;
			min-height: fit-content;
		}

		&.invisible {
			opacity: 0;
		}
	}
</style>
