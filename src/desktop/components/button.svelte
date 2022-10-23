<script lang="ts">
	import { isNonNullable } from '@tinyslice/core';
	import { fromEvent, Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { tap } from 'svelte-gestures';
	import { ButtonLook } from './button-look.enum';

	const dispatch = createEventDispatcher();

	export let disabled = false;
	export let appearDisabled = false;
	export let pressed = false;
	export let longpressTime = 250;
	export let type: 'button' | 'menu' | 'submit' | 'reset' = 'button';
	export let look: ButtonLook | undefined = undefined;

	export let selfPress = true;
	export let hotkeyLetter: string | undefined = undefined;
	export let toggled: boolean | undefined = undefined;
	export let active: boolean | undefined = undefined;

	let longpressHappened = false;
	let cancelHappened = false;

	let mouseUpListener: Subscription | undefined;
	let firing = false;

	export let button: HTMLElement | undefined = undefined;

	if (selfPress) {
		mouseUpListener = fromEvent(document, 'mouseup').subscribe(() => {
			pressed = false;
			cancelLongpress();
		});
	}

	function pointerdown(event: PointerEvent): void {
		longpressHappened = false;
		cancelHappened = false;
		firing = true;
		if (event.button === 0 || event.button === 1 || event.pointerType === 'touch') {
			startFire();
			longpress();
			if (selfPress) {
				pressed = true;
			}
		}
	}

	function pointerup(e: PointerEvent): void {
		if (firing && !longpressHappened && !cancelHappened) {
			cancelLongpress();
			if (e.button === 0 || e.button === 1) {
				fire();
				if (selfPress) {
					pressed = true;
				}
			} else if (e.button === 2) {
				alternativeFire();
				if (selfPress) {
					pressed = true;
				}
			}
		}
	}

	function tapmove(event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) {
		if (event.detail.event.pointerType === 'touch') {
			const elementsUnderFinger = document.elementsFromPoint(
				event.detail.event.pageX,
				event.detail.event.pageY
			);
			if (!elementsUnderFinger.includes(event.detail.event.target as Element)) {
				cancelFire();
				if (selfPress) {
					pressed = false;
				}
			}
		}
	}

	function longpress(): void {
		longpressTimeout = window.setTimeout(() => {
			if (!longpressHappened && !cancelHappened) {
				longpressHappened = true;
				cancelLongpress();
				alternativeFire();
			}
		}, longpressTime);
	}

	let longpressTimeout: number | undefined;

	function cancelLongpress() {
		firing = false;
		if (isNonNullable(longpressTimeout)) {
			window.clearTimeout(longpressTimeout);
			longpressTimeout = undefined;
		}
	}

	function pointerleave() {
		if (firing) {
			cancelFire();
		}
	}

	function startFire() {
		if (!disabled) {
			dispatch('startFire');
		}
	}

	function fire() {
		firing = false;
		if (!disabled) {
			dispatch('fire');
			cancelLongpress();
		}
	}

	function alternativeFire() {
		firing = false;
		if (!disabled) {
			dispatch('alternativeFire');
			cancelLongpress();
		}
	}

	function cancelFire() {
		firing = false;
		if (!disabled && pressed && !cancelHappened) {
			cancelHappened = true;
			cancelLongpress();
			dispatch('cancelFire');
		}
	}

	onDestroy(() => {
		if (mouseUpListener) {
			mouseUpListener.unsubscribe();
		}
	});
</script>

<button
	bind:this={button}
	{type}
	class="ms-button {$$props.class ?? ''}"
	aria-label={$$props['aria-label']}
	style={$$props.style}
	class:disabled={disabled || appearDisabled}
	class:hotkey-letter={!!hotkeyLetter}
	class:active
	class:selfPress
	class:pressed
	class:toggleable={toggled !== undefined}
	class:toggleable-context={look === ButtonLook.CONTEXT_MENU_ITEM}
	class:type-none={look === undefined}
	class:type-any={look !== undefined}
	class:type-thick={look === ButtonLook.THICK}
	class:type-thick-but-pressed-thin={look === ButtonLook.THICK_PRESSED_THIN}
	class:type-title-bar-menu-bar-item={look === ButtonLook.TITLE_BAR_MENU_ITEM}
	class:type-context-menu-item={look === ButtonLook.CONTEXT_MENU_ITEM}
	class:type-start-menu-item={look === ButtonLook.START_MENU_ITEM}
	use:tap
	on:tap
	on:tapup
	on:tapdown
	on:tapmove={tapmove}
	on:click
	on:mouseup
	on:mousedown
	on:mouseenter
	on:dblclick
	on:contextmenu|preventDefault
	on:pointercancel
	on:pointerenter
	on:pointerup={pointerup}
	on:pointerdown={pointerdown}
	on:pointerleave={pointerleave}
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
		display: flex;
		align-items: center;
		flex-direction: row;
		flex-wrap: nowrap;
		gap: 4px;

		font-size: 18px;
		line-height: 14px;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none !important;

		white-space: nowrap;
		text-overflow: ellipsis;

		image-rendering: pixelated;
		background-repeat: no-repeat;
		color: black;

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

		&.disabled {
			cursor: default;
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

		&.type-start-menu-item {
			padding: 8px 0 8px 8px;
			height: 32px;
			width: 160px;

			&:hover {
				background-color: #000084;
				color: white;
			}
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
