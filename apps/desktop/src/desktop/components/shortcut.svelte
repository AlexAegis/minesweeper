<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
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
	<div class="icon">
		<Image class="icon" alt="{shortcutState.name}" src="{shortcutState.icon}" />
	</div>
	<div class="shortcut-symbol"></div>
	<div class="title">{shortcutState.name}</div>
</div>
