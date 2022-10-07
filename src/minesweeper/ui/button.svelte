<script lang="ts">
	import { fromEvent, Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { ButtonType } from './button-type.enum';

	const dispatch = createEventDispatcher();
	export let mousedown = false;
	export let type: ButtonType | undefined = undefined;
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
	class:type-none={type === undefined}
	class:type-any={type !== undefined}
	class:type-thick={type === ButtonType.THICK}
	class:type-thick-but-pressed-thin={type === ButtonType.THICK_PRESSED_THIN}
	class:type-title-bar-menu-bar-item={type === ButtonType.TITLE_BAR_MENU_ITEM}
	class:type-context-menu-item={type === ButtonType.CONTEXT_MENU_ITEM}
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

<style lang="scss">
	button {
		font-size: 18px;
	}

	.type-context-menu-item {
		width: 130px;
		height: 19px;
		text-align: left;
	}

	.type-context-menu-item:hover {
		background-color: #000084;
		color: white;
	}

	.type-thick-but-pressed-thin,
	.type-thick {
		border-spacing: 3px;
		border-width: 3px;
		border-style: solid;
		border-color: #eee;
	}

	.type-thick:active {
		padding: 4px 2px 2px 4px;
	}

	.type-thick-but-pressed-thin:not(.pressed),
	.type-thick:not(.pressed) {
		border-style: outset;
	}

	.type-thick.pressed {
		border-style: inset;
	}

	.type-thick-but-pressed-thin.pressed {
		border-style: solid;
		border-color: #a6a6a6;
		border-width: 1px;
	}

	.type-any {
		box-shadow: none !important;
		min-width: 1px !important;
		min-height: 1px !important;
		outline: none;
	}

	.type-title-bar-menu-bar-item {
		padding: 0px 12px 1px 12px;
	}

	.type-context-menu-item:active,
	.type-title-bar-menu-bar-item:active {
		padding: 1px 11px 0px 13px;
	}
</style>
