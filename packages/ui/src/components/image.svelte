<script lang="ts">
	export let alt: string | undefined = undefined;
	export let src: string | undefined = undefined;
	export let disabled = false;

	export let height: number | undefined = undefined;
	export let width: number | undefined = undefined;
</script>

{#if src}
	<img
		class={$$props['class'] ?? ''}
		style={$$props['style'] ?? ''}
		style:height={height ? `${height.toString()}px` : undefined}
		style:width={width ? `${width.toString()}px` : undefined}
		style:min-height={height ? `${height.toString()}px` : undefined}
		style:min-width={width ? `${width.toString()}px` : undefined}
		draggable={false}
		aria-label={alt}
		{src}
		{alt}
		class:disabled
	/>
{:else}
	<div
		style:height={height ? `${height.toString()}px` : undefined}
		style:width={width ? `${width.toString()}px` : undefined}
		style:min-height={height ? `${height.toString()}px` : undefined}
		style:min-width={width ? `${width.toString()}px` : undefined}
	></div>
{/if}
