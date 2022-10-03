<script lang="ts">
	import { fromEvent, Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { ButtonLook } from './button-look.enum';

	const dispatch = createEventDispatcher();
	export let mousedown = false;
	export let customLook: ButtonLook | undefined = undefined;
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
	class="ms-button {$$props.class}"
	aria-label={$$props['aria-label']}
	style={$$props.style}
	disabled={$$props.disabled}
	class:pressed={mousedown}
	class:customlook={!!customLook}
	class:customlook-thick={customLook === ButtonLook.THICK}
	class:customlook-thick-but-pressed-thin={customLook === ButtonLook.THICK_PRESSED_THIN}
	class:customlook-menu-item={customLook === ButtonLook.MENU_ITEM}
	on:click
	on:mouseup
	on:mousedown={onMouseDown}
	on:mouseenter
	on:mouseleave
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
		font-size: 18px;
	}

	.customlook-menu-item {
	}

	.customlook-thick-but-pressed-thin,
	.customlook-thick {
		border-spacing: 3px;
		border-width: 3px;
		border-style: solid;
		border-color: #eee;
	}

	.customlook-thick-but-pressed-thin:not(.pressed),
	.customlook-thick:not(.pressed) {
		border-style: outset;
	}

	.customlook-thick.pressed {
		border-style: inset;
	}

	.customlook-thick-but-pressed-thin.pressed {
		border-style: solid;
		border-color: #a6a6a6;
		border-width: 1px;
	}

	.customlook {
		box-shadow: none !important;
		min-width: 1px !important;
		min-height: 1px !important;
		outline: none;
	}
</style>
