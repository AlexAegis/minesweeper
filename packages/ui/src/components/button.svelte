<script lang="ts">
	import { isNotNullish } from '@alexaegis/common';
	import { documentPointerUp$ } from '@w2k/core';
	import type { Subscription } from 'rxjs';
	import { onDestroy, type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonLook } from './button-look.enum';
	import Image from './image.svelte';

	interface Props extends HTMLButtonAttributes {
		disabled?: boolean;
		appearDisabled?: boolean;
		pressed?: boolean;
		longpressTime?: number;
		type?: 'button' | 'submit' | 'reset';
		look?: ButtonLook | undefined;
		icon?: string | undefined;
		label?: string | undefined;
		title?: string | undefined;
		bold?: boolean;
		id?: string | undefined;
		selfPress?: boolean | undefined;
		hotkeyLetter?: string | undefined;
		active?: boolean | undefined;
		button?: HTMLElement | undefined;
		onStartFire?: (() => void) | undefined;
		onFire?: (() => void) | undefined;
		onAlternativeFire?: (() => void) | undefined;
		onCancelFire?: (() => void) | undefined;
		children?: Snippet;
	}

	let {
		disabled = false,
		appearDisabled = false,
		pressed = $bindable(false),
		longpressTime = 275,
		type = 'button',
		look = undefined,
		icon = undefined,
		label = undefined,
		title = undefined,
		bold = false,
		id = undefined,
		selfPress = true,
		hotkeyLetter = undefined,
		active = undefined,
		button = $bindable(undefined),
		onStartFire = undefined,
		onFire = undefined,
		onAlternativeFire = undefined,
		onCancelFire = undefined,
		children = undefined,
		class: className = '',
		style = '',
		onpointerdown,
		onpointerup,
		onpointerleave,
		oncontextmenu,
		...rest
	}: Props = $props();

	let longpressHappened = false;
	let cancelHappened = false;

	let mouseUpListener: Subscription | undefined;
	let firing = false;

	// svelte-ignore state_referenced_locally
	if (selfPress) {
		mouseUpListener = documentPointerUp$.subscribe(() => {
			pressed = false;
			cancelLongpress();
		});
	}

	function pointerdown(event: PointerEvent & { currentTarget: HTMLButtonElement }): void {
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
		onpointerdown?.(event);
	}

	function pointerup(e: PointerEvent & { currentTarget: HTMLButtonElement }): void {
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
		onpointerup?.(e);
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
		if (isNotNullish(longpressTimeout)) {
			window.clearTimeout(longpressTimeout);
			longpressTimeout = undefined;
		}
	}

	function pointerleave(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
		if (firing) {
			cancelFire();
		}
		onpointerleave?.(event);
	}

	function contextmenu(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		event.preventDefault();
		event.stopPropagation();
		oncontextmenu?.(event);
	}

	function startFire() {
		if (!disabled) {
			onStartFire?.();
		}
	}

	function fire() {
		firing = false;
		if (!disabled) {
			onFire?.();
			cancelLongpress();
		}
	}

	function alternativeFire() {
		firing = false;
		if (!disabled) {
			onAlternativeFire?.();
			cancelLongpress();
		}
	}

	function cancelFire() {
		firing = false;
		if (!disabled && pressed && !cancelHappened) {
			cancelHappened = true;
			cancelLongpress();
			onCancelFire?.();
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
	{id}
	{type}
	{disabled}
	{title}
	class={className}
	class:outset={!pressed}
	class:inset={pressed}
	{style}
	class:disabled={disabled || appearDisabled}
	class:hotkey-letter={!!hotkeyLetter}
	class:active
	class:selfPress
	class:pressed
	class:bold
	class:flat={look === ButtonLook.CONTEXT_MENU_ITEM ||
		look === ButtonLook.START_MENU_ITEM ||
		look === ButtonLook.TITLE_BAR_MENU_ITEM}
	class:type-none={look === undefined}
	class:type-thick={look === ButtonLook.THICK}
	class:type-taskbar-item={look === ButtonLook.TASKBAR_ITEM}
	class:type-title-bar-menu-item={look === ButtonLook.TITLE_BAR_MENU_ITEM}
	class:type-context-menu-item={look === ButtonLook.CONTEXT_MENU_ITEM}
	class:type-start-menu-item={look === ButtonLook.START_MENU_ITEM}
	oncontextmenu={contextmenu}
	onpointerup={pointerup}
	onpointerdown={pointerdown}
	onpointerleave={pointerleave}
	{...rest}
>
	{#if look === ButtonLook.CONTEXT_MENU_ITEM}
		<Image height={16} width={16} src={icon}></Image>
		<span>
			{@render children?.()}
		</span>
	{:else if look === ButtonLook.TASKBAR_ITEM}
		<span class="taskbar-button-icon">
			<Image height={16} width={16} src={icon} alt={label} />
		</span>

		<span>
			{@render children?.()}
		</span>
	{:else}
		{@render children?.()}
	{/if}
</button>

<style lang="scss">
	button {
		background-position-x: var(--background-image-position, 1px);
		background-position-y: var(--background-image-position, 1px);

		&.pressed:not(.fixmeselector) {
			background-position-x: calc(var(--background-image-position, 1px) + 1px);
			background-position-y: calc(var(--background-image-position, 1px) + 1px);
		}
	}
</style>
