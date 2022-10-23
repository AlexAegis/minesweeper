<script lang="ts">
	export let alt: string;
	export let src: string;
</script>

<img
	class={$$props.class ?? ''}
	style={$$props.style ?? ''}
	draggable={false}
	aria-label={alt}
	{src}
	{alt}
/>

<style>
	img {
		image-rendering: pixelated;
		width: auto;
		height: inherit;
	}
</style>
