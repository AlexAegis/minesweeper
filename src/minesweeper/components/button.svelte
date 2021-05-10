<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { documentMouseUp$ } from '../store';

	const dispatch = createEventDispatcher();
	export let mousedown: boolean | undefined = false;

	const s = documentMouseUp$.subscribe((documentMouseUp) => {
		if (documentMouseUp) {
			mousedown = false;
		}
	});

	function onMouseDown(e: MouseEvent): void {
		dispatch('mousedown');
		if (e.button === 0) {
			mousedown = true;
		}
	}

	onDestroy(() => s.unsubscribe());

</script>

<button
	class="button {$$props.class}"
	aria-label={$$props['aria-label']}
	style={$$props.style}
	disabled={$$props.disabled}
	class:inset={mousedown === true}
	on:mousedown={onMouseDown}
	on:contextmenu
	on:click
>
	<slot />
</button>

<style>
	button {
		font-family: monospace;
	}

</style>
