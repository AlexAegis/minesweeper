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
		border-spacing: 2px;
		border-width: 2px;
		border-left-style: solid;
		border-top-style: solid;

		border-color: var(--panel-border-color);
	}

	.type-thick:active {
		padding: 2px 1px 1px 2px;
	}

	.type-thick-but-pressed-thin:not(.pressed),
	.type-thick:not(.pressed) {
		border-style: outset;
	}

	.type-thick.pressed {
		border-style: inset;
	}

	.type-thick-but-pressed-thin.pressed {
		border-left-style: solid;
		border-top-style: solid;
		border-color: var(--tile-border-color);
		border-width: 1px;
		background-position-x: 2px;
		background-position-y: 2px;
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
