<script lang="ts">
	import Button from './button.svelte';

	import { w2kClassicStartMenuIcon, w2kStandardStartMenuIcon } from '../assets/index.js';
	import Image from './image.svelte';

	import { map } from 'rxjs';
	import type { DesktopSlice } from '../store/desktop.store';
	import StartMenu from './start-menu.svelte';

	export let desktopSlice: DesktopSlice;
	export let startButton: HTMLElement;

	$: startMenuOpen$ = desktopSlice.startMenuOpen$;

	const startIcon$ = desktopSlice.activeSchemeKind$.pipe(
		map((kind) => (kind === 'w2k' ? w2kStandardStartMenuIcon : w2kClassicStartMenuIcon)),
	);
</script>

{#if $startMenuOpen$}
	<StartMenu {startButton} {desktopSlice} />
{/if}

<Button
	id="start"
	class="start"
	bind:button="{startButton}"
	bind:active="{$startMenuOpen$}"
	on:startFire="{() => {
		startMenuOpen$.set(!startMenuOpen$.value);
	}}"
>
	<Image height="{14}" src="{$startIcon$}" />
</Button>
