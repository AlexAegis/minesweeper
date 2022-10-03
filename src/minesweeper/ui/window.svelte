<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TitleBar from './title-bar.svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let icon: string | undefined = undefined;
	export let inactive: boolean = false;
	export let tight: boolean = false;

	function minimize() {
		dispatch('minimize');
	}

	function maximize() {
		dispatch('minimize');
	}

	function close() {
		dispatch('minimize');
	}
</script>

<div class="window {$$props.class}">
	<TitleBar
		{title}
		{icon}
		{inactive}
		on:minimize={minimize}
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
	.window {
		height: fit-content;
		width: fit-content;
	}

	.tight {
		margin: 0;
	}
</style>
