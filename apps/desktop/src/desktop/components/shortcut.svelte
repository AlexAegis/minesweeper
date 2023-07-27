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
		console.log('CONTEXT');
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
	<div class="shortcut-symbol"></div>
	<div class="title">{shortcutState.name}</div>
</div>

<style lang="scss">
	.shortcut {
		display: grid;
		grid-template-columns: 1fr 28px 1fr;
		position: absolute;
		row-gap: 4px;
		align-items: center;
		justify-items: center;
		margin: 16px;
		user-select: none;
		touch-action: none;
		cursor: pointer;

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
			min-height: 18px;
			min-width: 30px;
			max-width: calc(2 * 40px);
			word-wrap: break-word;
			grid-row: 2;
			grid-column: 1 / -1;
			color: var(--win-desktop-font-color)
		}

		&.selected {
			:global(.icon) {
				filter: contrast(0.75) brightness(0.4) sepia(3.6) hue-rotate(180deg) saturate(2);
			}

			.title {
				background-color: rgb(var(--win-selection-rgb));
				color: var(--win-desktop-selected-font-color); // Always
			}
		}
	}
</style>
