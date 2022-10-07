<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TitleBar from './title-bar.svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let icon: string | undefined = undefined;
	export let inactive: boolean = false;
	export let tight: boolean = false;
	export let maximized: boolean = false;
	export let resizable: boolean = true;
	export let x: number = 12;
	export let y: number = 20;

	function drag(dragEvent: CustomEvent<{ x: number; y: number }>) {
		x = dragEvent.detail.x;
		y = dragEvent.detail.y;
	}

	function minimize() {
		dispatch('minimize');
	}

	function restore() {
		maximized = false;
		dispatch('restore');
	}

	function maximize() {
		maximized = true;
		dispatch('maximize');
	}

	function close() {
		dispatch('close');
	}
</script>

<div class="ms-window window {$$props.class}" class:maximized style={`top: ${y}px; left: ${x}px`}>
	<TitleBar
		{title}
		{icon}
		{inactive}
		{maximized}
		{resizable}
		on:minimize={minimize}
		on:restore={restore}
		on:maximize={maximize}
		on:close={close}
		on:drag={drag}
	/>
	<div class="window-body" class:tight>
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
			height: 100%;
			width: 100%;
			top: 0 !important;
			left: 0 !important;
		}
		&:not(.maximized) {
			height: fit-content;
			width: fit-content;
		}

		.tight {
			margin: 0;
		}
	}
</style>
