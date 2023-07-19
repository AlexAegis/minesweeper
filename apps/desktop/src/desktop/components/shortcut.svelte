<script lang="ts">
	import type { CoordinateLike } from '@alexaegis/desktop-common';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { desktop$, type ShortcutState } from '../store';
	import { firable } from './firable.action';
	import Image from './image.svelte';
	import { InteractBuilder } from './resizable.function';

	export let shortcutState: ShortcutState;

	export let selected = false;

	const dispatch = createEventDispatcher<{
		drop: CoordinateLike;
	}>();

	let shortcutElement: HTMLElement;
	let moveInteract: InteractBuilder;

	$: transientPosition = { ...shortcutState.position };

	function move(delta: CoordinateLike) {
		transientPosition.x += delta.x;
		transientPosition.y += delta.y;
	}

	function drop() {
		dispatch('drop', transientPosition);
		selected = !selected;
	}

	onMount(() => {
		moveInteract = InteractBuilder.from(shortcutElement).movable(move);
		moveInteract.interactable.on('dragend', (_event: DragEvent): void => {
			drop();
		});
	});

	onDestroy(() => {
		if (moveInteract) {
			moveInteract.interactable.off('dragend');
			moveInteract.unsubscribe();
		}
	});

	function spawn(): void {
		desktop$.internals.actions.spawnProgram.next(shortcutState.program);
	}

	function contextmenu(): void {
		console.log('COPNTEXT');
	}
</script>

<div
	bind:this="{shortcutElement}"
	use:firable="{{ draggable: true }}"
	on:alternativefire="{() => {
		contextmenu();
	}}"
	on:fire="{() => (selected = !selected)}"
	on:startfire="{() => {
		if (!selected) {
			selected = true;
		}
	}}"
	on:doublefire="{() => {
		spawn();
	}}"
	class="shortcut"
	class:selected
	style:top="{`${transientPosition.y}px`}"
	style:left="{`${transientPosition.x}px`}"
>
	<Image class="icon" alt="{shortcutState.name}" src="{shortcutState.icon}" />
	<span class="title">{shortcutState.name}</span>
	<div class="shortcut-symbol"></div>
</div>

<style lang="scss">
	.shortcut {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		position: absolute;
		row-gap: 4px;
		align-items: center;
		justify-items: center;
		margin: 16px;
		user-select: none;
		touch-action: none;

		:global(.icon) {
			width: 28px;
			height: 28px;
			grid-row: 1;
			grid-column: 2;
		}

		.shortcut-symbol {
			width: 11px;
			height: 11px;
			background-image: var(--asset-shortcut);
			background-repeat: no-repeat;
			image-rendering: pixelated;
			z-index: 1;
			grid-row: 1;
			grid-column: 2;
			justify-self: start;
			align-self: end;
		}

		.title {
			padding: 0 2px;
			user-select: none;
			font-size: 18px;
			line-height: 18px;
			grid-row: 2;
			grid-column: 1 / -1;
			color: black;
		}

		&.selected {
			:global(.icon) {
				// box-shadow: inset 0 0 0 2000px rgba(var(--selection-rgb), 0.5);
				filter: contrast(0.5) brightness(1.5) sepia(1) hue-rotate(180deg) contrast(0.8)
					saturate(4);
			}

			.title {
				background-color: rgb(var(--selection-rgb));
				color: white;
			}
		}


	}
</style>
