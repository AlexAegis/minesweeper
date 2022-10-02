<script lang="ts">
	import Image from './image.svelte';
	import Panel from './panel.svelte';

	export let title: string;
	export let icon: string;
</script>

<Panel style="padding: 3px; justify-content: flex-start;" class="ms-title-bar-panel">
	<Image class="ms-title-bar-icon" src={icon} alt={title} />
	{title}
	<slot />
</Panel>

<style>
	:global(.ms-title-bar-icon) {
		filter: drop-shadow(0px 0px 8px rgba(180, 180, 255, 0.8));
	}

	:global(.ms-title-bar-panel) {
		height: 20px;
		padding: 3px;
		font-family: monospace;

		align-items: center;

		color: white;
		background: rgb(0, 20, 87);
		background: linear-gradient(90deg, rgba(0, 20, 87, 1) 0%, rgba(0, 171, 255, 1) 100%);
	}
</style>
