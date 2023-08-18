<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { ButtonLook, ContextMenu } from '../components';
	import { type DesktopSlice, type ShortcutId, type ShortcutState } from '../store';
	import Button from './button.svelte';
	import { firable } from './firable.action';
	import Image from './image.svelte';
	import { InteractBuilder } from './resizable.function';

	export let desktopSlice: DesktopSlice;

	export let shortcutState: ShortcutState;

	const dispatch = createEventDispatcher<{
		drop: CoordinateLike;
		select: ShortcutId;
	}>();

	let shortcutElement: HTMLElement | undefined = undefined;
	export let shortcutIconElement: HTMLElement | undefined = undefined;

	let moveInteract: InteractBuilder;

	$: transientPosition = { ...shortcutState.position };

	function move(delta: CoordinateLike) {
		transientPosition.x += delta.x;
		transientPosition.y += delta.y;
	}

	function drop() {
		dispatch('drop', transientPosition);
	}

	onMount(() => {
		if (shortcutElement) {
			moveInteract = InteractBuilder.from(shortcutElement).movable(move);
			moveInteract.interactable.on('dragend', (_event: DragEvent): void => {
				drop();
			});
		}
	});

	onDestroy(() => {
		if (moveInteract) {
			moveInteract.interactable.off('dragend');
			moveInteract.unsubscribe();
		}
	});

	function spawn(): void {
		desktopSlice.desktop$.internals.actions.spawnProgram.next(shortcutState.program);
	}

	function select(): void {
		dispatch('select', shortcutState.shortcutId);
	}

	function deleteShortcut(): void {
		desktopSlice.dicedShortcuts.remove(shortcutState.shortcutId);
	}

	let contextMenuPosition: CoordinateLike | undefined = undefined;
</script>

<div
	bind:this="{shortcutElement}"
	id="{'shortcut' + shortcutState.shortcutId}"
	use:firable="{{ draggable: true }}"
	on:contextmenu|stopPropagation="{(event) => {
		select();
		contextMenuPosition = contextMenuPosition ? undefined : { x: event.pageX, y: event.pageY };
	}}"
	aria-label="shortcut"
	role="button"
	tabindex="0"
	on:click="{() => {
		select();
	}}"
	on:keydown
	on:dblclick="{() => {
		spawn();
	}}"
	on:pointerdown|stopPropagation
	class="shortcut"
	class:selected="{shortcutState.selected}"
	style:top="{`${transientPosition.y}px`}"
	style:left="{`${transientPosition.x}px`}"
>
	<div class="icon" bind:this="{shortcutIconElement}">
		<Image class="icon" alt="{shortcutState.name}" src="{shortcutState.icon}" />
	</div>
	<div class="shortcut-symbol"></div>
	<div class="title">{shortcutState.name}</div>

	<ContextMenu bind:position="{contextMenuPosition}" spawnElement="{shortcutElement}">
		<Button look="{ButtonLook.CONTEXT_MENU_ITEM}" on:click="{() => spawn()}" bold="{true}">
			Open
		</Button>
		<hr />
		<slot />
		{#if $$slots.default}
			<hr />
		{/if}
		<Button look="{ButtonLook.CONTEXT_MENU_ITEM}" on:click="{() => deleteShortcut()}">
			Delete
		</Button>
	</ContextMenu>
</div>
