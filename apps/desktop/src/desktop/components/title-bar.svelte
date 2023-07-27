<script lang="ts">
	import Image from './image.svelte';

	import { Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import type { TitleBarEvents } from './title-bar-events.interface';

	const dispatch = createEventDispatcher<TitleBarEvents>();

	export let title: string;
	export let icon: string | undefined = undefined;
	export let active = true;
	export let maximized = false;
	export let resizable = true;
	export let showMinimize = true;
	export let showMaximize = true;
	export let showClose = true;

	const sink = new Subscription();

	function minimize() {
		dispatch('minimize');
	}

	function maximize() {
		if (maximized) {
			dispatch('restore');
		} else {
			dispatch('maximize');
		}
	}

	function close() {
		dispatch('close');
	}

	let lastTap = 0;

	function dbltap() {
		const tap = Date.now();
		if (tap - lastTap < 250) {
			maximize();
		}
		lastTap = tap;
	}

	onDestroy(() => {
		sink.unsubscribe();
	});
</script>

<div
	class="title-bar"
	class:active
	on:dblclick="{maximize}"
	on:pointerdown="{dbltap}"
	role="presentation"
>
	<div aria-label="title" class="title-bar-text">
		{#if icon}
			<Image class="ms-title-bar-icon" src="{icon}" alt="{title}" />
		{/if}
		{title}
		<slot />
	</div>

	<div class="title-bar-controls">
		{#if showMinimize}
			<button aria-label="Minimize" on:click|preventDefault|stopPropagation="{minimize}"
			></button>
		{/if}

		{#if showMaximize}
			<button
				aria-label="{maximized ? 'Restore' : 'Maximize'}"
				on:click|preventDefault|stopPropagation="{maximize}"
				disabled="{!resizable}"
			></button>
		{/if}
		{#if showClose}
			<button aria-label="Close" on:click|preventDefault|stopPropagation="{close}"></button>
		{/if}
	</div>
</div>

<style lang="scss">
	// 98.css
	.title-bar {
		user-select: none;
		touch-action: none;
		cursor: default;

		// Part of scheme
		font-weight: bold;



		// 98.css
		.title-bar-text {
			display: flex;
			gap: 2px;
			align-items: center;
			text-transform: capitalize;
		}

		&.active {
			background: linear-gradient(
				90deg,
				var(--win-active-title-bar-color),
				var(--win-active-title-bar-color-2)
			);

			.title-bar-text {
				color: var(--win-active-title-bar-font-color);
			}
		}

		&:not(.active) {
			background: linear-gradient(
				90deg,
				var(--win-inactive-title-bar-color),
				var(--win-inactive-title-bar-color-2)
			);

			.title-bar-text {
				color: var(--win-inactive-title-bar-font-color);
			}
		}

		:global(.ms-title-bar-icon) {
			filter: drop-shadow(0 0 8px rgb(180 180 255 / 80%));
			max-height: 13px;
		}
	}
</style>
