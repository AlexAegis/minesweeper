<script lang="ts">
	import Image from './image.svelte';

	import { Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { tap as tapGesture } from 'svelte-gestures';

	const dispatch = createEventDispatcher();

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

<div class="title-bar" on:dblclick={maximize} use:tapGesture on:tapdown={dbltap}>
	<div aria-label="title" class="title-bar-text" class:active>
		{#if icon}
			<Image class="ms-title-bar-icon" src={icon} alt={title} />
		{/if}
		{title}
		<slot />
	</div>

	<div class="title-bar-controls">
		{#if showMinimize}
			<button
				aria-label="Minimize"
				use:tapGesture
				on:click|preventDefault|stopPropagation={minimize}
				on:tap|preventDefault|stopPropagation
				on:mousemove|preventDefault|stopPropagation
				on:mousedown|preventDefault|stopPropagation
				on:tapup|preventDefault|stopPropagation
				on:tapdown|preventDefault|stopPropagation
				on:tapmove|preventDefault|stopPropagation
				on:dblclick|preventDefault|stopPropagation
			/>
		{/if}

		{#if showMaximize}
			<button
				aria-label={maximized ? 'Restore' : 'Maximize'}
				use:tapGesture
				on:click|preventDefault|stopPropagation={maximize}
				on:tap|preventDefault|stopPropagation
				on:mousemove|preventDefault|stopPropagation
				on:mousedown|preventDefault|stopPropagation
				on:tapup|preventDefault|stopPropagation
				on:tapdown|preventDefault|stopPropagation
				on:tapmove|preventDefault|stopPropagation
				on:dblclick|preventDefault|stopPropagation
				disabled={!resizable}
			/>
		{/if}
		{#if showClose}
			<button
				aria-label="Close"
				use:tapGesture
				on:click|preventDefault|stopPropagation={close}
				on:tap|preventDefault|stopPropagation
				on:mousemove|preventDefault|stopPropagation
				on:mousedown|preventDefault|stopPropagation
				on:tapup|preventDefault|stopPropagation
				on:tapdown|preventDefault|stopPropagation
				on:tapmove|preventDefault|stopPropagation
				on:dblclick|preventDefault|stopPropagation
			/>
		{/if}
	</div>
</div>

<style lang="scss">
	// 98.css
	.title-bar {
		user-select: none;
		touch-action: none;
		cursor: default;

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
