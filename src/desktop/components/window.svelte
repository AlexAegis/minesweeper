<script lang="ts">
	import { asapScheduler, filter, fromEvent, scheduled, tap } from 'rxjs';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import type { CoordinateLike } from '../../common';
	import { resizeWindow } from '../store';
	import { InteractBuilder, type ResizeData } from './resizable.function';
	import TitleBar from './title-bar.svelte';
	import { initialWindowState, type BaseWindowState } from './window-state.interface';

	let windowElement: HTMLElement;

	const dispatch = createEventDispatcher();

	export let windowState: Partial<BaseWindowState> | undefined = undefined;

	export let transient: boolean = false;

	$: transientState = {
		...initialWindowState,
		...windowState,
	};

	$: effectiveResizable = transientState.resizable && !transientState.maximized;
	$: effectiveMovable = !transientState.maximized;

	const clickListener = scheduled(fromEvent<PointerEvent>(document, 'pointerdown'), asapScheduler)
		.pipe(
			filter((event) => {
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return !elementsUnderPointer.includes(windowElement);
			}),
			tap(() => deactivate())
		)
		.subscribe();

	function activate() {
		if (!transientState.active) {
			dispatch('active', true);
			if (transient) {
				transientState = { ...transientState, active: true };
			}
		}
	}

	function deactivate() {
		if (transientState.active) {
			dispatch('active', false);
			if (transient) {
				transientState = { ...transientState, active: false };
			}
		}
	}

	function resize(next: ResizeData) {
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

	let moveInteract: InteractBuilder;
	let resizeInteract: InteractBuilder;

	$: resizeInteract?.toggle(effectiveResizable);
	$: moveInteract?.toggle(effectiveMovable);

	onMount(() => {
		moveInteract = InteractBuilder.from(windowElement).movable(move);
		resizeInteract = InteractBuilder.from(windowElement).resizable(resize);

		// Update size on render
		if (windowState) {
			if (transient) {
				windowState.width = windowElement.scrollWidth;
				windowState.height = windowElement.scrollHeight;
			} else {
				dispatch('resize', {
					height: windowElement.scrollHeight,
					width: windowElement.scrollWidth,
				} as ResizeData);
			}
		}
	});

	onDestroy(() => {
		moveInteract.unsubscribe();
		resizeInteract.unsubscribe();
		clickListener.unsubscribe();
	});
</script>

<div
	bind:this={windowElement}
	class="ms-window window pid{transientState.processId} {transientState.program} {$$props.class ??
		''}"
	class:invisible={transientState.invisible}
	class:immobile={!effectiveMovable}
	class:non-resizable={!effectiveResizable}
	class:maximized={transientState.maximized}
	class:fit-content={transientState.fitContent}
	class:active={transientState.active}
	style:top={`${transientState.position.y}px`}
	style:left={`${transientState.position.x}px`}
	style:height={`${transientState.height}px`}
	style:width={`${transientState.width}px`}
	on:pointerdown={activate}
>
	<TitleBar
		title={transientState.title}
		icon={transientState.icon}
		active={transientState.active}
		maximized={transientState.maximized}
		resizable={transientState.resizable}
		showMinimize={!transient}
		showMaximize={transientState.resizable}
		showClose={true}
		on:minimize={minimize}
		on:restore={restore}
		on:maximize={maximize}
		on:close={close}
	/>
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
	.ms-window {
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

		position: absolute;
		box-sizing: border-box;
		user-select: none;

		// touch-action: none;

		.menu {
			min-height: 20px;
			display: flex;

			:global(button:first-letter) {
				text-transform: uppercase;
			}
		}

		.window-body {
			overflow: auto;
			margin: 0;
		}

		&.maximized {
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
