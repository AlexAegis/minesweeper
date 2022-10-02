<script lang="ts">
	import { fromEvent, Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher();
	export let mousedown: boolean | undefined = false;

	export let disableSelfInset = false;

	let mouseUpListener: Subscription | undefined;

	if (!disableSelfInset) {
		mouseUpListener = fromEvent(document, 'mouseup').subscribe(() => (mousedown = false));
	}

	function onMouseDown(e: MouseEvent): void {
		dispatch('mousedown');
		if (e.button === 0) {
			if (!disableSelfInset) {
				mousedown = true;
			}
		}
	}

	onDestroy(() => {
		if (mouseUpListener) {
			mouseUpListener.unsubscribe();
		}
	});
</script>

<button
	class="button {$$props.class}"
	aria-label={$$props['aria-label']}
	style={$$props.style}
	disabled={$$props.disabled}
	class:inset={mousedown === true}
	on:click
	on:mouseup
	on:mousedown={onMouseDown}
	on:contextmenu
	on:pointerup
	on:pointerdown
	on:pointercancel
	on:pointerout
	on:pointerenter
>
	<slot />
</button>

<style>
	button {
		font-family: monospace;
	}
</style>
