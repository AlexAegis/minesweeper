<script lang="ts">
	import type { Rectangle } from './rectangle.interface';

	export let area: Rectangle | undefined;
</script>

{#if area}
	<div
		class="selection"
		style:top="{`${area.y}px`}"
		style:left="{`${area.x}px`}"
		style:width="{`${area.width}px`}"
		style:height="{`${area.height}px`}"
	></div>
{/if}
