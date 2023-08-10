<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import type { Subject } from 'rxjs';
	import { onDestroy } from 'svelte';
	import Modal from './modal.svelte';
	import { initialWindowState, type BaseWindowState } from './window-state.interface';
	import Window from './window.svelte';

	export let windowState: Partial<BaseWindowState>;

	$: effectiveWindowState = {
		...initialWindowState,
		...windowState,
		showMinimize: false,
		active: true,
	};

	export let isOpen = false;

	let errorNotification: Subject<void>;

	const centerOf = (
		position: CoordinateLike,
		size: CoordinateLike,
		sizeOfTarget?: CoordinateLike,
	): CoordinateLike => {
		return {
			x: position.x + Math.floor(size.x / 2) - Math.floor((sizeOfTarget?.x ?? 0) / 2),
			y: position.y + Math.floor(size.y / 2) - Math.floor((sizeOfTarget?.y ?? 0) / 2),
		};
	};

	export function open(parentWindow?: BaseWindowState) {
		windowState.invisible = true;
		isOpen = true;
		// Let the modal window mount before calculating center
		setTimeout(() => {
			windowState.position = centerOf(
				parentWindow?.position ?? { x: 0, y: 0 },
				{
					x: parentWindow?.width ?? document.body.scrollWidth,
					y: parentWindow?.height ?? document.body.scrollHeight,
				},
				{ x: effectiveWindowState.width, y: effectiveWindowState.height },
			);
			windowState.invisible = false;
		}, 0);
	}

	export function close(_event?: CustomEvent<undefined>) {
		// Let stuff clear itself
		setTimeout(() => {
			isOpen = false;
		}, 0);
	}

	export function backdropClick(event: MouseEvent) {
		if ((event.target as Element).className.includes('modal')) {
			errorNotification.next();
		}
	}

	onDestroy(() => {
		errorNotification?.complete();
	});
</script>

<Modal bind:isOpen backdropCanClose="{false}" on:error="{() => errorNotification?.next(undefined)}">
	<Window
		windowState="{effectiveWindowState}"
		transient="{true}"
		on:close="{close}"
		bind:errorNotification
	>
		<slot />
	</Window>
</Modal>
