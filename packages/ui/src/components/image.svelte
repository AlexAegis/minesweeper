<script lang="ts">
	interface Props {
		alt?: string | undefined;
		src?: string | undefined;
		disabled?: boolean;
		height?: number | undefined;
		width?: number | undefined;
		class?: string | undefined;
		style?: string | undefined;
	}

	let {
		alt = undefined,
		src = undefined,
		disabled = false,
		height = undefined,
		width = undefined,
		class: className = '',
		style = '',
	}: Props = $props();
</script>

{#if src}
	<img
		class={className}
		{style}
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
