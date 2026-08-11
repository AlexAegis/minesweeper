<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { ButtonLook, ContextMenu } from '../components';
	import { readGlobal, type GrippyContainer, type Handler, type Vec2 } from '../helpers';
	import type { ProgramId, ShortcutId, ShortcutState } from '../store';
	import Button from './button.svelte';
	import Image from './image.svelte';

	let shortcutElement: HTMLElement | undefined = $state(undefined);
	interface Props {
		shortcutState: ShortcutState;
		grippy: GrippyContainer;
		/**
		 * Comes from the program the shortcut points to, shortcuts don't store
		 * an icon of their own
		 */
		icon?: string | undefined;
		shortcutIconElement?: HTMLElement | undefined;
		onMove?: ((position: Vec2) => void) | undefined;
		onDrop?: ((position: Vec2) => void) | undefined;
		onSelect?: ((shortcutId: ShortcutId) => void) | undefined;
		onSpawn?: ((program: ProgramId) => void) | undefined;
		onDelete?: ((shortcutId: ShortcutId) => void) | undefined;
		onBeginRename?: ((shortcutId: ShortcutId) => void) | undefined;
		onRename?: ((rename: Pick<ShortcutState, 'shortcutId' | 'name'>) => void) | undefined;
		ondblclick?: ((event: MouseEvent) => void) | undefined;
		children?: Snippet;
	}

	let {
		shortcutState,
		grippy,
		icon = undefined,
		shortcutIconElement = $bindable(undefined),
		onMove = undefined,
		onDrop = undefined,
		onSelect = undefined,
		onSpawn = undefined,
		onDelete = undefined,
		onBeginRename = undefined,
		onRename = undefined,
		ondblclick = undefined,
		children,
	}: Props = $props();

	let dragHandler: Handler | undefined;

	let transientPosition = $derived({ ...shortcutState.position });

	function move(position: Vec2) {
		onMove?.(position);
	}

	function drop(position: Vec2) {
		onDrop?.(position);
	}

	onMount(() => {
		if (shortcutElement) {
			dragHandler = grippy.draggable({
				target: shortcutElement,
				listeners: {
					move: (data) => {
						move(data.cursor.delta);
					},
					moveEnd: (data) => {
						drop(data.cursor.client);
					},
				},
			});
		}
	});

	onDestroy(() => {
		dragHandler?.unsubscribe();
	});

	function spawn(): void {
		onSpawn?.(shortcutState.program);
	}

	function select(): void {
		onSelect?.(shortcutState.shortcutId);
	}

	function deleteShortcut(): void {
		onDelete?.(shortcutState.shortcutId);
	}

	function beginRenameShortcut(): void {
		onBeginRename?.(shortcutState.shortcutId);
	}

	function rename(e: SubmitEvent): void {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		onRename?.({
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			name: formData.get('name')?.toString() || shortcutState.name,
			shortcutId: shortcutState.shortcutId,
		});
	}

	function keydown(e: KeyboardEvent): void {
		switch (e.key) {
			case 'Enter': {
				spawn();
				break;
			}
			case 'F2': {
				beginRenameShortcut();
				break;
			}
			case 'Delete': {
				deleteShortcut();
				break;
			}
			case 'Escape': {
				onRename?.({
					name: shortcutState.name,
					shortcutId: shortcutState.shortcutId,
				});
				break;
			}
		}
	}

	function keydownRename(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			onRename?.({
				name: shortcutState.name,
				shortcutId: shortcutState.shortcutId,
			});
		}
	}
	let contextMenuPosition: Vec2 | undefined = $state(undefined);

	let pointerMovedDuringClick = $state(false);
</script>

<div
	bind:this={shortcutElement}
	id={'shortcut' + shortcutState.shortcutId.toString()}
	oncontextmenu={(event) => {
		event.preventDefault();
		event.stopPropagation();
		contextMenuPosition = contextMenuPosition
			? undefined
			: { x: event.pageX / readGlobal('w2kZoom'), y: event.pageY / readGlobal('w2kZoom') };
	}}
	aria-label="shortcut"
	role="button"
	tabindex="0"
	onkeydown={keydown}
	ondblclick={() => {
		spawn();
	}}
	onclick={() => {
		if (!pointerMovedDuringClick) {
			select();
		}
	}}
	onpointermove={() => {
		pointerMovedDuringClick = true;
	}}
	onpointerdown={() => {
		pointerMovedDuringClick = false;
	}}
	class="shortcut"
	class:selected={shortcutState.selected && !shortcutState.renaming}
	style:top={`${transientPosition.y.toString()}px`}
	style:left={`${transientPosition.x.toString()}px`}
>
	<div class="icon" bind:this={shortcutIconElement}>
		<Image class="icon" alt={shortcutState.name} src={icon} />
	</div>
	<div class="shortcut-symbol"></div>
	{#if shortcutState.renaming}
		<form class="title" onsubmit={rename}>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				class="input"
				type="text"
				name="name"
				autofocus
				value={shortcutState.name}
				onkeydown={(event) => {
					event.stopPropagation();
					keydownRename(event);
				}}
				ondblclick={(event) => {
					event.stopPropagation();
					ondblclick?.(event);
				}}
			/>
		</form>
	{:else}
		<div class="title">
			{shortcutState.name}
		</div>
	{/if}
</div>

<ContextMenu bind:position={contextMenuPosition} spawnElement={shortcutElement}>
	<Button look={ButtonLook.CONTEXT_MENU_ITEM} onclick={() => spawn()} bold={true}>Open</Button>
	<hr />
	{@render children?.()}
	{#if children}
		<hr />
	{/if}
	<Button look={ButtonLook.CONTEXT_MENU_ITEM} onclick={() => deleteShortcut()}>Delete</Button>
	<Button look={ButtonLook.CONTEXT_MENU_ITEM} onclick={() => beginRenameShortcut()}>
		Rename
	</Button>
</ContextMenu>
