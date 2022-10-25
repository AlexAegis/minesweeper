<script lang="ts">
	import type { CoordinateLike } from '@alexaegis/desktop-common';

	export let position: CoordinateLike;
</script>

<div class="context-menu window" style:top={`${position.y}px`} style:left={`${position.x}px`}>
	<slot />
</div>

<style lang="scss">
	.context-menu {
		display: block;
		position: absolute;
		z-index: 2000;
		width: 200px;
		min-height: 16px;
	}
</style>
