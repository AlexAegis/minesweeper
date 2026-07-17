<script lang="ts">
	import { defer } from '@w2k/common';
	import { onDestroy, type Snippet } from 'svelte';
	import { nudgeAreaIntoArea } from '../helpers/nudge-area-into-area.function';
	import { centerRectangleIntoRectancle, getWorkspaceRectangle } from '../store';
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

	export function open(centeringElement?: Element | undefined | null) {
		windowState.invisible = true;
		isOpen = true;

		const centerElement = centeringElement ?? document.body;
		// Let the modal window mount before calculating center

		const centerElementRect = centerElement.getBoundingClientRect();

		const workspaceRectangle = getWorkspaceRectangle();

		defer(() => {
			windowState.position = centerRectangleIntoRectancle(
				effectiveWindowState,
				centerElementRect,
			);

			if (workspaceRectangle && modalWindowElement) {
				const windowRectangle = modalWindowElement.getBoundingClientRect();

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
			windowInstance?.errorNotification.next();
		}
	}

	onDestroy(() => {
		windowInstance?.errorNotification.complete();
	});
	let effectiveWindowState = $derived({
		...initialWindowState,
		...windowState,
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
