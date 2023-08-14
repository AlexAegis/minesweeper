<script lang="ts">
	import Image from './image.svelte';

	import { createEventDispatcher } from 'svelte';
	import type { TitleBarEvents } from './title-bar-events.interface';
	import type { WindowState } from './window-state.interface';

	const dispatch = createEventDispatcher<TitleBarEvents>();

	export let windowState: WindowState;
	export let error: boolean | undefined = false;

	function minimize() {
		dispatch('minimize');
	}

	function maximize() {
		if (windowState.maximized) {
			dispatch('restore');
		} else {
			dispatch('maximize');
		}
	}

	function help() {
		dispatch('help');
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
</script>

<div
	class="title-bar {$$props['class'] ?? ''}"
	style="{$$props['style'] ?? ''}"
	class:active="{windowState.active && !error}"
	class:error
	on:dblclick="{maximize}"
	on:pointerdown="{dbltap}"
	on:contextmenu|preventDefault
	role="presentation"
>
	{#if windowState.titleBarIcon}
		<div class="title-bar-icon">
			<Image
				class="title-bar-icon"
				src="{windowState.titleBarIcon}"
				alt="{windowState.title}"
			/>
		</div>
	{/if}

	<div aria-label="title" class="title-bar-text">
		{windowState.title}
		<slot />
	</div>

	<div class="title-bar-controls">
		{#if windowState.showMinimize}
			<button
				aria-label="Minimize"
				disabled="{!windowState.minimizeEnabled}"
				on:click|preventDefault|stopPropagation="{minimize}"
			></button>
		{/if}

		{#if windowState.showMaximize}
			<button
				aria-label="{windowState.maximized ? 'Restore' : 'Maximize'}"
				on:click|preventDefault|stopPropagation="{maximize}"
				disabled="{!windowState.maximizeEnabled || !windowState.resizable}"
			></button>
		{/if}

		{#if windowState.showHelp}
			<button
				aria-label="Help"
				on:click|preventDefault|stopPropagation="{help}"
				disabled="{!windowState.helpEnabled}"
			></button>
		{/if}

		{#if windowState.showClose}
			<button
				aria-label="Close"
				on:click|preventDefault|stopPropagation="{close}"
				disabled="{!windowState.closeEnabled}"
			></button>
		{/if}
	</div>
</div>
