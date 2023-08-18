<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { ButtonLook, ContextMenu } from '../components';
	import type { ProgramId, ShortcutId, ShortcutState } from '../store';
	import Button from './button.svelte';
	import { firable } from './firable.action';
	import Image from './image.svelte';
	import { InteractBuilder } from './resizable.function';

	export let shortcutState: ShortcutState;

	const dispatch = createEventDispatcher<{
		drop: CoordinateLike;
		select: ShortcutId;
		spawn: ProgramId;
		delete: ShortcutId;
		beginRename: ShortcutId;
		rename: Pick<ShortcutState, 'shortcutId' | 'name'>;
	}>();

	let shortcutElement: HTMLElement | undefined = undefined;
	export let shortcutIconElement: HTMLElement | undefined = undefined;

	let moveInteract: InteractBuilder;

	$: transientPosition = { ...shortcutState.position };

	function move(delta: CoordinateLike) {
		console.log('Moving shortcut!');
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
		dispatch('spawn', shortcutState.program);
	}

	function select(): void {
		dispatch('select', shortcutState.shortcutId);
	}

	function deleteShortcut(): void {
		dispatch('delete', shortcutState.shortcutId);
	}

	function beginRenameShortcut(): void {
		dispatch('beginRename', shortcutState.shortcutId);
	}

	function rename(e: SubmitEvent): void {
		const formData = new FormData(e.target as HTMLFormElement);
		dispatch('rename', {
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			name: formData.get('name')?.toString() || shortcutState.name,
			shortcutId: shortcutState.shortcutId,
		});
	}

	function keydown(e: KeyboardEvent): void {
		console.log(e);
		switch (e.key) {
			case 'Enter': {
				spawn();
				break;
			}
			case 'F2': {
				beginRenameShortcut();
				break;
			}
			case 'Escape': {
				dispatch('rename', {
					name: shortcutState.name,
					shortcutId: shortcutState.shortcutId,
				});
				break;
			}
		}
	}

	function keydownRename(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			dispatch('rename', {
				name: shortcutState.name,
				shortcutId: shortcutState.shortcutId,
			});
		}
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
	on:keydown="{keydown}"
	on:dblclick="{() => {
		spawn();
	}}"
	on:pointerdown|stopPropagation
	class="shortcut"
	class:selected="{shortcutState.selected && !shortcutState.renaming}"
	style:top="{`${transientPosition.y}px`}"
	style:left="{`${transientPosition.x}px`}"
>
	<div class="icon" bind:this="{shortcutIconElement}">
		<Image class="icon" alt="{shortcutState.name}" src="{shortcutState.icon}" />
	</div>
	<div class="shortcut-symbol"></div>
	{#if shortcutState.renaming}
		<form class="title" on:submit|preventDefault="{rename}">
			<!-- svelte-ignore a11y-autofocus -->
			<input
				class="input"
				type="text"
				name="name"
				autofocus
				value="{shortcutState.name}"
				on:keydown|stopPropagation="{keydownRename}"
				on:dblclick|stopPropagation
			/>
		</form>
	{:else}
		<div class="title">
			{shortcutState.name}
		</div>
	{/if}
</div>

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
	<Button look="{ButtonLook.CONTEXT_MENU_ITEM}" on:click="{() => beginRenameShortcut()}">
		Rename
	</Button>
</ContextMenu>
