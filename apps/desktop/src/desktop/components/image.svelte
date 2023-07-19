<script lang="ts">
	export let alt: string | undefined = undefined;
	export let src: string | undefined = undefined;

	export let height: number | undefined = undefined;
	export let width: number | undefined = undefined;
</script>

{#if src}
	<img
		class="{$$props['class'] ?? ''}"
		style="{$$props['style'] ?? ''}"
		style:height="{height ? `${height}px` : undefined}"
		style:width="{width ? `${width}px` : undefined}"
		draggable="{false}"
		aria-label="{alt}"
		{src}
		{alt}
	/>
{:else}
	<div
		style:height="{height ? `${height}px` : undefined}"
		style:width="{width ? `${width}px` : undefined}"
	></div>
{/if}

<style>
	img {
		image-rendering: pixelated;
		width: auto;
		height: inherit;
	}
</style>
