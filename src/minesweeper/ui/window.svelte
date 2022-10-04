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

	function minimize() {
		dispatch('minimize');
	}

	function restore() {
		dispatch('restore');
		maximized = false;
	}

	function maximize() {
		dispatch('maximize');
		maximized = true;
		console.log('max');
	}

	function close() {
		dispatch('close');
	}
</script>

<div class="ms-window window {$$props.class}" class:maximized>
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

<style>
	.window:not(.maximized) {
		height: fit-content;
		width: fit-content;
	}

	.window.maximized {
		height: 100%;
		width: 100%;
	}

	.tight {
		margin: 0;
	}
</style>
