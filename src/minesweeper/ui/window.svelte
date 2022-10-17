<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import type { CoordinateLike } from '../core';
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

	function resize(next: ResizeData) {
		dispatch('resize', next);
		if (transient) {
			transientState.width = next.width;
			transientState.height = next.height;
		}
	}

	function move(delta: CoordinateLike) {
		dispatch('move', delta);
		if (transient) {
			transientState.position.x = delta.x;
			transientState.position.y = delta.y;
		}
	}

	function minimize() {
		dispatch('minimize');
	}

	function restore() {
		dispatch('restore');
		interact.on();
		if (transient) {
			transientState.maximized = false;
		}
	}

	function maximize() {
		dispatch('maximize');
		interact.off();
		if (transient) {
			transientState.maximized = true;
		}
	}

	function close() {
		dispatch('close');
	}

	let interact: InteractBuilder;

	onMount(() => {
		interact = InteractBuilder.from(windowElement).movable(move).resizable(resize);
	});

	onDestroy(() => {
		interact.unsubscribe();
	});
</script>

<div
	bind:this={windowElement}
	class="ms-window window pid{transientState.processId} {transientState.program} {$$props.class ??
		''}"
	class:immobile={transientState.maximized}
	class:maximized={transientState.maximized}
	style:top={`${transientState.position.y}px`}
	style:left={`${transientState.position.x}px`}
	style:height={`${transientState.height}px`}
	style:width={`${transientState.width}px`}
>
	<TitleBar
		title={transientState.title}
		icon={transientState.icon}
		active={transientState.active}
		maximized={transientState.maximized}
		resizable={transientState.resizable}
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
		display: flex;
		flex-direction: column;

		position: absolute;
		box-sizing: border-box;
		user-select: none;

		touch-action: none;

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
	}
</style>
