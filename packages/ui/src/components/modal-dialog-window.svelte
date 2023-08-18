<script lang="ts">
	import { defer, type CoordinateLike } from '@w2k/common';
	import type { Subject } from 'rxjs';
	import { onDestroy } from 'svelte';
	import { nudgeAreaIntoArea } from '../helpers/nudge-area-into-area.function';
	import Modal from './modal.svelte';
	import type { Rectangle } from './rectangle.interface';
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

	let modalWindowElement: HTMLElement;
	let errorNotification: Subject<void>;

	const centerOf = (position: Rectangle, sizeOfTarget: CoordinateLike): CoordinateLike => {
		return {
			x: position.x + Math.floor(position.width / 2) - Math.floor(sizeOfTarget.x / 2),
			y: position.y + Math.floor(position.height / 2) - Math.floor(sizeOfTarget.y / 2),
		};
	};

	export function open(centeringElement?: Element | undefined | null) {
		windowState.invisible = true;
		isOpen = true;

		const centerElement = centeringElement ?? document.body;
		// Let the modal window mount before calculating center

		const centerElementRect = centerElement.getBoundingClientRect();

		const workspaceElement = document.querySelector('#workspace');

		defer(() => {
			windowState.position = centerOf(centerElementRect, {
				x: effectiveWindowState.width,
				y: effectiveWindowState.height,
			});

			if (workspaceElement && modalWindowElement) {
				const windowRectangle = modalWindowElement.getBoundingClientRect();

				const workspaceRectangle = workspaceElement.getBoundingClientRect();

				windowState.position = nudgeAreaIntoArea(
					{
						...windowState.position,
						height: windowRectangle.height,
						width: windowRectangle.width,
					},
					workspaceRectangle,
				);
			}

			windowState.invisible = false;
		})();
	}

	export function close(_event?: CustomEvent<undefined>) {
		// Let stuff clear itself
		defer(() => {
			isOpen = false;
		})();
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
		bind:windowElement="{modalWindowElement}"
		windowState="{effectiveWindowState}"
		transient="{true}"
		canDeactivate="{false}"
		on:close="{close}"
		bind:errorNotification
	>
		<slot />
	</Window>
</Modal>
