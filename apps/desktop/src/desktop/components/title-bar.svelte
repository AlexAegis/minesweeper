<script lang="ts">
	import Image from './image.svelte';

	import { Subscription } from 'rxjs';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import type { TitleBarEvents } from './title-bar-events.interface';

	const dispatch = createEventDispatcher<TitleBarEvents>();

	export let title: string;
	export let icon: string | undefined = undefined;
	export let active: boolean | undefined = true;
	export let maximized: boolean | undefined = false;
	export let resizable: boolean | undefined = true;
	export let showMinimize: boolean | undefined = true;
	export let minimizeEnabled: boolean | undefined = true;
	export let showMaximize: boolean | undefined = true;
	export let maximizeEnabled: boolean | undefined = true;
	export let showClose: boolean | undefined = true;
	export let closeEnabled: boolean | undefined = true;
	export let showHelp: boolean | undefined = false;
	export let helpEnabled: boolean | undefined = true;

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
	{#if icon}
		<div class="title-bar-icon">
			<Image class="ms-title-bar-icon" src="{icon}" alt="{title}" />
		</div>
	{/if}

	<div aria-label="title" class="title-bar-text">
		{title}
		<slot />
	</div>

	<div class="title-bar-controls">
		{#if showMinimize}
			<button
				aria-label="Minimize"
				disabled="{!minimizeEnabled}"
				on:click|preventDefault|stopPropagation="{minimize}"
			></button>
		{/if}

		{#if showMaximize}
			<button
				aria-label="{maximized ? 'Restore' : 'Maximize'}"
				on:click|preventDefault|stopPropagation="{maximize}"
				disabled="{!maximizeEnabled || !resizable}"
			></button>
		{/if}

		{#if showHelp}
			<button
				aria-label="Help"
				on:click|preventDefault|stopPropagation="{help}"
				disabled="{!helpEnabled}"
			></button>
		{/if}

		{#if showClose}
			<button
				aria-label="Close"
				on:click|preventDefault|stopPropagation="{close}"
				disabled="{!closeEnabled}"
			></button>
		{/if}
	</div>
</div>
