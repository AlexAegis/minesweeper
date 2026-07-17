<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { KeyboardEventHandler } from 'svelte/elements';

	interface Props {
		backdropCanClose?: boolean;
		isOpen?: boolean;
		darkBackdrop?: boolean;
		style?: string | undefined;
		onError?: (() => void) | undefined;
		onkeypress?: KeyboardEventHandler<HTMLDivElement> | undefined;
		children?: Snippet;
	}

	let {
		backdropCanClose = true,
		isOpen = $bindable(false),
		darkBackdrop = false,
		style = undefined,
		onError = undefined,
		onkeypress = undefined,
		children = undefined,
	}: Props = $props();

	export function open() {
		isOpen = true;
	}

	export function close(_event?: CustomEvent<undefined>) {
		// Let stuff clear itself
		setTimeout(() => {
			isOpen = false;
		}, 0);
	}

	function backdropClick(event: MouseEvent) {
		if (backdropCanClose) {
			close();
		} else if ((event.target as Element).className.includes('modal')) {
			onError?.();
		}
	}
</script>

{#if isOpen}
	<div
		class="modal-backdrop"
		role="button"
		aria-roledescription="closes the modal"
		tabindex="-1"
		class:dark-backdrop={darkBackdrop}
		{style}
		{onkeypress}
		onclick={backdropClick}
	>
		{@render children?.()}
	</div>
{/if}
