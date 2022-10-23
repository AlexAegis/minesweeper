<script lang="ts">
	import Image from './image.svelte';

	import { Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import type { TitleBarEvents } from './title-bar-events.interface';

	const dispatch = createEventDispatcher<TitleBarEvents>();

	export let title: string;
	export let icon: string | undefined = undefined;
	export let active: boolean = true;
	export let maximized: boolean = false;
	export let resizable: boolean = true;
	export let showMinimize: boolean = true;
	export let showMaximize: boolean = true;
	export let showClose: boolean = true;

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
		const tap = new Date().getTime();
		if (tap - lastTap < 250) {
			maximize();
		}
		lastTap = tap;
	}

	onDestroy(() => sink.unsubscribe());
</script>

<div class="title-bar" class:active on:dblclick={maximize} on:pointerdown={dbltap}>
	<div aria-label="title" class="title-bar-text">
		{#if icon}
			<Image class="ms-title-bar-icon" src={icon} alt={title} />
		{/if}
		{title}
		<slot />
	</div>

	<div class="title-bar-controls">
		{#if showMinimize}
			<button aria-label="Minimize" on:click|preventDefault|stopPropagation={minimize} />
		{/if}

		{#if showMaximize}
			<button
				aria-label={maximized ? 'Restore' : 'Maximize'}
				on:click|preventDefault|stopPropagation={maximize}
				disabled={!resizable}
			/>
		{/if}
		{#if showClose}
			<button aria-label="Close" on:click|preventDefault|stopPropagation={close} />
		{/if}
	</div>
</div>

<style lang="scss">
	// 98.css
	.title-bar {
		user-select: none;
		touch-action: none;
		cursor: default;

		&:not(.active) {
			background: linear-gradient(90deg, #808080, #c0c0c0);

			.title-bar-text {
				color: #c8c8c8;
			}
		}
		// 98.css
		.title-bar-text {
			display: flex;
			gap: 2px;
			align-items: center;
			text-transform: capitalize;
		}

		:global(.ms-title-bar-icon) {
			filter: drop-shadow(0px 0px 8px rgba(180, 180, 255, 0.8));
			max-height: 13px;
		}
	}
</style>
