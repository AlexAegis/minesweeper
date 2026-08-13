<script lang="ts">
	import { defer, type CoordinateLike } from '@w2k/common';
	import { onDestroy, type Snippet } from 'svelte';
	import { getSpawnRectangle } from '../helpers';
	import { nudgeAreaIntoArea } from '../helpers/nudge-area-into-area.function';
	import { centerRectangleIntoRectangle } from '../store';
	import Modal from './modal.svelte';
	import { initialWindowState, type BaseWindowState } from './window-state.interface';
	import Window from './window.svelte';

	interface Props {
		windowState: Partial<BaseWindowState>;
		isOpen?: boolean;
		children?: Snippet;
	}

	let { windowState = $bindable(), isOpen = $bindable(false), children }: Props = $props();

	let modalWindowElement: HTMLElement | undefined = $state();
	let windowInstance: Window | undefined = $state();

	/**
	 * Where the dialog ended up, and whether it can be shown yet. This has to
	 * be local reactive state: `windowState` is usually a plain object literal
	 * passed in by the caller, and mutating it from the deferred measurement
	 * would never reach the rendered window.
	 */
	let placement: { invisible: boolean; position: CoordinateLike | undefined } = $state({
		invisible: false,
		position: undefined,
	});

	export function open(centeringElement?: HTMLElement | undefined | null) {
		placement.invisible = true;
		isOpen = true;

		const centerElement = centeringElement ?? document.body;

		// Let the modal window mount, its own size is only measurable afterwards
		defer(() => {
			if (modalWindowElement) {
				const dialogArea = getSpawnRectangle(modalWindowElement);

				const position = centerRectangleIntoRectangle(
					dialogArea,
					getSpawnRectangle(centerElement),
				);

				const workspaceElement = document.querySelector<HTMLElement>('#workspace');

				placement.position = workspaceElement
					? nudgeAreaIntoArea(
							{ ...dialogArea, ...position },
							getSpawnRectangle(workspaceElement),
						)
					: position;
			}

			placement.invisible = false;
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
			windowInstance?.errorNotification.next();
		}
	}

	onDestroy(() => {
		windowInstance?.errorNotification.complete();
	});
	let effectiveWindowState = $derived({
		...initialWindowState,
		...windowState,
		...(placement.position ? { position: placement.position } : {}),
		invisible: placement.invisible,
		showMinimize: false,
		active: true,
	});
</script>

<Modal
	bind:isOpen
	backdropCanClose={false}
	onError={() => windowInstance?.errorNotification.next(undefined)}
>
	<Window
		bind:this={windowInstance}
		bind:windowElement={modalWindowElement}
		windowState={effectiveWindowState}
		transient={true}
		canDeactivate={false}
		onClose={close}
	>
		{@render children?.()}
	</Window>
</Modal>
