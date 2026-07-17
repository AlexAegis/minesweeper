<script lang="ts">
	import type { Rectangle } from './rectangle.interface';

	interface Props {
		area: Rectangle | undefined;
	}

	let { area }: Props = $props();
</script>

{#if area}
	<div
		class="selection"
		style:top={`${area.y.toString()}px`}
		style:left={`${area.x.toString()}px`}
		style:width={`${area.width.toString()}px`}
		style:height={`${area.height.toString()}px`}
	></div>
{/if}
