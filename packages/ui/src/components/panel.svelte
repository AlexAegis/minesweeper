<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		[key: string]: any;
	}

	let { ...props }: Props = $props();
</script>

<div class={props['class'] ?? ''} style={props['style'] ?? ''}>
	{@render props.children?.()}
</div>

<style>
	div {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		padding: 5px;
	}
</style>
