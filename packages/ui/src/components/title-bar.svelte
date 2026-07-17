<script lang="ts">
	import Image from './image.svelte';

	import type { Snippet } from 'svelte';
	import type { WindowState } from './window-state.interface';

	interface Props {
		windowState: WindowState;
		error?: boolean | undefined;
		class?: string | undefined;
		style?: string | undefined;
		onMinimize?: (() => void) | undefined;
		onMaximize?: (() => void) | undefined;
		onRestore?: (() => void) | undefined;
		onHelp?: (() => void) | undefined;
		onClose?: (() => void) | undefined;
		oncontextmenu?: ((event: MouseEvent) => void) | undefined;
		children?: Snippet;
	}

	let {
		windowState,
		error = false,
		class: className = '',
		style = '',
		onMinimize = undefined,
		onMaximize = undefined,
		onRestore = undefined,
		onHelp = undefined,
		onClose = undefined,
		oncontextmenu = undefined,
		children = undefined,
	}: Props = $props();

	function minimize() {
		onMinimize?.();
	}

	function maximize() {
		if (windowState.maximized) {
			onRestore?.();
		} else {
			onMaximize?.();
		}
	}

	function help() {
		onHelp?.();
	}

	function close() {
		onClose?.();
	}

	let lastTap = 0;

	function dbltap() {
		const tap = Date.now();
		if (tap - lastTap < 250) {
			maximize();
		}
		lastTap = tap;
	}

	function withModifiers(handler: () => void): (event: Event) => void {
		return (event) => {
			event.preventDefault();
			event.stopPropagation();
			handler();
		};
	}
</script>

<div
	class="title-bar {className}"
	{style}
	class:active={windowState.active && !error}
	class:error
	ondblclick={maximize}
	onpointerdown={dbltap}
	oncontextmenu={(event) => {
		event.preventDefault();
		oncontextmenu?.(event);
	}}
	role="presentation"
>
	{#if windowState.titleBarIcon}
		<div class="title-bar-icon">
			<Image class="title-bar-icon" src={windowState.titleBarIcon} alt={windowState.title} />
		</div>
	{/if}

	<div aria-label="title" class="title-bar-text">
		{windowState.title}
		{@render children?.()}
	</div>

	<div class="title-bar-controls">
		{#if windowState.showMinimize}
			<button
				aria-label="Minimize"
				disabled={!windowState.minimizeEnabled}
				onclick={withModifiers(minimize)}
			></button>
		{/if}

		{#if windowState.showMaximize}
			<button
				aria-label={windowState.maximized ? 'Restore' : 'Maximize'}
				onclick={withModifiers(maximize)}
				disabled={!windowState.maximizeEnabled || !windowState.resizable}
			></button>
		{/if}

		{#if windowState.showHelp}
			<button
				aria-label="Help"
				onclick={withModifiers(help)}
				disabled={!windowState.helpEnabled}
			></button>
		{/if}

		{#if windowState.showClose}
			<button
				aria-label="Close"
				onclick={withModifiers(close)}
				disabled={!windowState.closeEnabled}
			></button>
		{/if}
	</div>
</div>
