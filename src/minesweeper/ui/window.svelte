<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TitleBar from './title-bar.svelte';
	import type { WindowState } from './window-state.interface';

	const dispatch = createEventDispatcher();

	export let windowState: WindowState;

	function move(dragEvent: CustomEvent<{ x: number; y: number }>) {
		dispatch('move', { x: dragEvent.detail.x, y: dragEvent.detail.y });
	}

	function minimize() {
		dispatch('minimize');
	}

	function restore() {
		dispatch('restore');
	}

	function maximize() {
		dispatch('maximize');
	}

	function close() {
		dispatch('close');
	}
</script>

<div
	class="ms-window window pid{windowState.programId} {$$props.class}"
	class:maximized={windowState.maximized}
	style:top={`${windowState.y}px`}
	style:left={`${windowState.x}px`}
	style:height={`${windowState.height}px`}
	style:width={`${windowState.width}px`}
>
	<TitleBar
		title={windowState.title}
		icon={windowState.icon}
		active={windowState.active}
		maximized={windowState.maximized}
		resizable={windowState.resizable}
		on:minimize={minimize}
		on:restore={restore}
		on:maximize={maximize}
		on:close={close}
		on:drag={move}
	/>
	<div class="window-body" class:tight={windowState.tight}>
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
		position: relative;
		box-sizing: border-box;

		&.maximized {
			height: 100% !important;
			width: 100% !important;
			top: 0 !important;
			left: 0 !important;
		}
		&:not(.maximized) {
			height: fit-content;
			width: fit-content;

			min-width: fit-content;
			min-height: fit-content;
		}

		.tight {
			margin: 0;
		}
	}
</style>
