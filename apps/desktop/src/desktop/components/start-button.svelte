<script lang="ts">
	import { activeSchemeKind$, startMenuOpen$ } from '../store';
	import Button from './button.svelte';

	import Image from './image.svelte';

	import w2kStartIcon from '../../assets/desktop/w2k-start.png';
	import w98StartIcon from '../../assets/desktop/w98-start.png';

	import { map } from 'rxjs';
	import StartMenu from './start-menu.svelte';

	export let startButton: HTMLElement;

	const startIcon$ = activeSchemeKind$.pipe(
		map((kind) => (kind === 'w2k' ? w2kStartIcon : w98StartIcon)),
	);
</script>

{#if $startMenuOpen$}
	<StartMenu {startButton} />
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
