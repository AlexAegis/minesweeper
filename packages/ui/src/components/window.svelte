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
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	import { sleep } from '@alexaegis/common';
	import { documentPointerDown$ } from '@w2k/core';
	import { ContextMenu } from '../components';
	import type { Handler } from '../helpers';
	import type { GrippyContainer } from '../helpers/grippy/grippy';
	import { formatPid, getWorkspaceRectangle, resizeWindow } from '../store';
	import type { Rectangle } from './rectangle.interface';
	import { formatAnimationVariables, type TaskBarAnimationFrame } from './taskbar-animation';
	import type { TitleBarEvents } from './title-bar-events.interface';
	import TitleBar from './title-bar.svelte';
	import { initialWindowState, type BaseWindowState } from './window-state.interface';

	export let windowElement: HTMLElement | undefined = undefined;
	export let grippy: GrippyContainer | undefined = undefined;

	const dispatch = createEventDispatcher<
		{
			activate: undefined;
			resize: Rectangle;
			move: CoordinateLike;
		} & TitleBarEvents
	>();

	export let windowState: Partial<BaseWindowState> | undefined = undefined;

	export let transient = false;
	export let canDeactivate = true;
	export let id: string | undefined = undefined;

	$: transientState = {
		...initialWindowState,
		...windowState,
	};

	$: effectiveResizable = transientState.resizable && !transientState.maximized;
	$: effectiveMovable = !transientState.maximized;

	$: {
		resizeHandler?.setEnabled(effectiveResizable);
	}

	$: {
		dragHandler?.setEnabled(effectiveMovable);
	}

	const sink = new Subscription();

	function activate() {
		if (!transientState.active) {
			dispatch('activate');
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
		dispatch('resize', next);
		if (transient) {
			transientState = resizeWindow(transientState, next);
		}
	}

	function move(delta: CoordinateLike) {
		dispatch('move', delta);
		if (transient) {
			transientState.position.x += delta.x;
			transientState.position.y += delta.y;
		}
	}

	function minimize() {
		dispatch('minimize');
	}

	function restore() {
		if (transientState.resizable) {
			dispatch('restore');
			if (transient) {
				transientState.maximized = false;
			}
		}
	}

	function maximize() {
		if (transientState.resizable) {
			dispatch('maximize');
			if (transient) {
				transientState.maximized = true;
			}
		}
	}

	function close() {
		dispatch('close');
	}

	let contextMenuPosition: CoordinateLike | undefined = undefined;

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

	$: errorFlash = $errorFlash$;

	let dragHandler: Handler | undefined;
	let resizeHandler: Handler | undefined;

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
					3;
					windowState.width = windowElement.scrollWidth;
					windowState.height = windowElement.scrollHeight;
				} else {
					dispatch('resize', {
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

	const getMaximizeAnimation = (
		windowState: BaseWindowState,
		stage: 'maximizing' | 'restoring',
	): string | undefined => {
		const windowId = formatPid(windowState.processId, 'window');

		const workspaceRect = getWorkspaceRectangle();
		const windowElement = document.querySelector(`#${windowId}`);

		if (!workspaceRect || !windowElement) {
			return undefined;
		}

		const windowRect = windowElement.getBoundingClientRect();

		const windowOffset: TaskBarAnimationFrame = {
			x: windowRect.x - workspaceRect.x,
			y: windowRect.y - workspaceRect.y,
			width: windowRect.width,
		};

		const workspaceOffset: TaskBarAnimationFrame = {
			x: 3,
			y: 3, // The distance from the edge of a window to the titlebar
			width: workspaceRect.width,
		};

		const fromOffset = stage === 'restoring' ? workspaceOffset : windowOffset;
		const toOffset = stage === 'maximizing' ? workspaceOffset : windowOffset;

		return formatAnimationVariables(fromOffset, toOffset);
	};
</script>

{#if transientState.maximized === 'maximizing' || transientState.maximized === 'restoring'}
	<TitleBar
		class="animate"
		windowState="{{
			...transientState,
			showMaximize: false,
			showMinimize: false,
			showHelp: false,
			showClose: false,
		}}"
		style="{getMaximizeAnimation(transientState, transientState.maximized)}"
	/>
{/if}

<div
	bind:this="{windowElement}"
	{id}
	class="program-window window pid{transientState.processId} {transientState.program} {$$props[
		'class'
	] ?? ''}"
	style="{$$props['style'] ?? ''}"
	class:invisible="{transientState.invisible}"
	class:immobile="{!effectiveMovable}"
	class:non-resizable="{!effectiveResizable}"
	class:minimized="{transientState.minimized === true}"
	class:minimizing="{transientState.minimized === 'minimizing'}"
	class:unminimizing="{transientState.minimized === 'unminimizing'}"
	class:maximized="{transientState.maximized === true}"
	class:maximizing="{transientState.maximized === 'maximizing'}"
	class:restoring="{transientState.maximized === 'restoring'}"
	class:fit-content="{transientState.fitContent}"
	class:active="{transientState.active}"
	style:top="{`${transientState.position.y}px`}"
	style:left="{`${transientState.position.x}px`}"
	style:height="{`${transientState.height}px`}"
	style:width="{`${transientState.width}px`}"
	style:z-index="{transientState.zIndex}"
	on:pointerdown="{activate}"
>
	<TitleBar
		windowState="{{
			...transientState,
			active: ((errorFlash === undefined && transientState.active) || errorFlash) ?? false,
		}}"
		on:minimize="{minimize}"
		on:restore="{restore}"
		on:maximize="{maximize}"
		on:close="{close}"
		on:contextmenu="{(event) => {
			contextMenuPosition = contextMenuPosition
				? undefined
				: { x: event.pageX, y: event.pageY };
		}}"
	>
		<ContextMenu bind:position="{contextMenuPosition}">
			<slot name="title-bar-context-menu" />
		</ContextMenu>
	</TitleBar>

	{#if $$slots.menu}
		<div class="menu">
			<slot name="menu" />
		</div>
	{/if}

	<div class="window-body">
		<slot />
	</div>

	{#if $$slots.statusBar}
		<div class="status-bar">
			<slot name="statusBar" />
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
