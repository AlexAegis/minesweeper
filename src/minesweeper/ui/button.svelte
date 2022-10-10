<script lang="ts">
	import { fromEvent, Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { ButtonLook } from './button-look.enum';

	const dispatch = createEventDispatcher();
	export let mousedown = false;
	export let type: 'button' | 'menu' | 'submit' | 'reset' = 'button';
	export let look: ButtonLook | undefined = undefined;

	export let disableSelfInset = false;
	export let hotkeyLetter: string | undefined = undefined;
	export let toggled: boolean | undefined = undefined;
	export let active: boolean | undefined = undefined;

	let mouseUpListener: Subscription | undefined;

	if (!disableSelfInset) {
		mouseUpListener = fromEvent(document, 'mouseup').subscribe(() => (mousedown = false));
	}

	function onMouseDown(e: MouseEvent): void {
		dispatch('mousedown');
		if (!disableSelfInset) {
			if (e.button === 0 || e.button === 1) {
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
	{type}
	class="ms-button {$$props.class ?? ''}"
	aria-label={$$props['aria-label']}
	style={$$props.style}
	disabled={$$props.disabled}
	class:hotkey-letter={!!hotkeyLetter}
	class:active
	class:disableSelfInset
	class:pressed={mousedown}
	class:toggleable={toggled !== undefined}
	class:toggleable-context={look === ButtonLook.CONTEXT_MENU_ITEM}
	class:type-none={look === undefined}
	class:type-any={look !== undefined}
	class:type-thick={look === ButtonLook.THICK}
	class:type-thick-but-pressed-thin={look === ButtonLook.THICK_PRESSED_THIN}
	class:type-title-bar-menu-bar-item={look === ButtonLook.TITLE_BAR_MENU_ITEM}
	class:type-context-menu-item={look === ButtonLook.CONTEXT_MENU_ITEM}
	on:click
	on:mouseup
	on:mousedown={onMouseDown}
	on:mouseenter
	on:dblclick
	on:mouseleave
	on:contextmenu
	on:pointerup
	on:pointerdown
	on:pointercancel
	on:pointerout
	on:pointerenter
>
	{#if look === ButtonLook.CONTEXT_MENU_ITEM}
		<span class="icon" class:checkmark={toggled} />
		<span>
			<slot />
		</span>
	{:else}
		<slot />
	{/if}
</button>

<style lang="scss">
	button {
		font-size: 18px;
		white-space: nowrap;
		text-overflow: ellipsis;

		image-rendering: pixelated;
		background-repeat: no-repeat;

		background-position-x: var(--background-image-positon, 1px);
		background-position-y: var(--background-image-positon, 1px);

		&.pressed:not(.disableSelfInset) {
			background-position-x: calc(var(--background-image-positon, 1px) + 1px);
			background-position-y: calc(var(--background-image-positon, 1px) + 1px);
		}

		&.toggleable-context {
			display: flex;
			gap: 8px;
			align-items: center;
		}

		.icon {
			width: 7px;
			height: 7px;

			&.checkmark {
				background-image: var(--asset-checkmark);
				image-rendering: pixelated;
				background-repeat: no-repeat;
			}
		}

		&.hotkey-letter {
			&:first-letter {
				text-decoration: underline !important;
			}
		}

		&:first-letter {
			text-transform: uppercase;
		}

		:first-letter {
			text-transform: uppercase;
		}

		&.type-context-menu-item {
			width: 100%;
			height: 20px;
			text-align: left;
		}

		&.type-title-bar-menu-bar-item {
			padding: 2px 12px 4px 12px;
		}

		&.active,
		&.type-title-bar-menu-bar-item:hover,
		&.type-context-menu-item:hover {
			background-color: #000084;
			color: white;
		}
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
</style>
