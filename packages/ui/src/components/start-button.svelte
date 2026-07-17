<script lang="ts">
	import Button from './button.svelte';

	import { w2kClassicStartMenuIcon, w2kStandardStartMenuIcon } from '../assets/index.js';
	import Image from './image.svelte';

	import { map } from 'rxjs';
	import type { DesktopSlice } from '../store/desktop.store';
	import StartMenu from './start-menu.svelte';

	interface Props {
		desktopSlice: DesktopSlice;
		startButton: HTMLElement;
	}

	let { desktopSlice, startButton = $bindable() }: Props = $props();

	let startMenuOpen$ = $derived(desktopSlice.startMenuOpen$);

	// svelte-ignore state_referenced_locally
	const startIcon$ = desktopSlice.activeSchemeKind$.pipe(
		map((kind) =>
			kind === 'classic-scheme' ? w2kStandardStartMenuIcon : w2kClassicStartMenuIcon,
		),
	);
</script>

{#if $startMenuOpen$}
	<StartMenu {startButton} {desktopSlice} />
{/if}

<Button
	id="start"
	class="start"
	bind:button={startButton}
	active={$startMenuOpen$}
	onStartFire={() => {
		startMenuOpen$.set(!startMenuOpen$.value);
	}}
>
	<Image height={14} src={$startIcon$} />
</Button>
