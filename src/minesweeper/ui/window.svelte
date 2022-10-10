<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TitleBar from './title-bar.svelte';
	import { initialWindowState, type WindowState } from './window-state.interface';

	const dispatch = createEventDispatcher();

	export let windowState: Partial<WindowState> | undefined = undefined;

	export let transient: boolean = false;

	$: transientState = {
		...initialWindowState,
		...windowState,
	};

	function move(dragEvent: CustomEvent<{ x: number; y: number }>) {
		dispatch('move', { x: dragEvent.detail.x, y: dragEvent.detail.y });
		console.log('move', transient, transientState, dragEvent.detail);
		if (transient) {
			transientState.x = dragEvent.detail.x;
			transientState.y = dragEvent.detail.y;
		}
	}

	function minimize() {
		dispatch('minimize');
	}

	function restore() {
		dispatch('restore');
		if (transient) {
			transientState.maximized = false;
		}
	}

	function maximize() {
		dispatch('maximize');
		if (transient) {
			transientState.maximized = true;
		}
	}

	function close() {
		dispatch('close');
	}
</script>

<div
	class="ms-window window pid{transientState.programId} {transientState.program} {$$props.class ??
		''}"
	class:maximized={transientState.maximized}
	style:top={`${transientState.y}px`}
	style:left={`${transientState.x}px`}
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
		on:drag={move}
	/>
	<div class="window-body" class:tight={transientState.tight}>
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
			display: table-cell;

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
