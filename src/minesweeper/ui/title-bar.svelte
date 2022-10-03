<script lang="ts">
	import Image from './image.svelte';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let icon: string | undefined = undefined;
	export let inactive: boolean = false;

	function minimize() {
		dispatch('minimize');
	}

	function maximize() {
		dispatch('maximize');
	}

	function close() {
		dispatch('close');
	}
</script>

<div class="title-bar">
	<div aria-label="title" class="title-bar-text" class:inactive>
		{#if icon}
			<Image class="ms-title-bar-icon" src={icon} alt={title} />
		{/if}
		{title}
		<slot />
	</div>

	<div class="title-bar-controls">
		<button aria-label="Minimize" on:click={minimize} />
		<button aria-label="Maximize" on:click={maximize} />
		<button aria-label="Close" on:click={close} />
	</div>
</div>

<style>
	:global(.ms-title-bar-icon) {
		filter: drop-shadow(0px 0px 8px rgba(180, 180, 255, 0.8));
		max-height: 13px;
	}

	.title-bar-text {
		display: flex;
		gap: 2px;
		align-items: center;
	}
</style>
