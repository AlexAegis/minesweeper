<script lang="ts">
	import type { Snippet } from 'svelte';
	import { W2kGlobal } from '@w2k/css';
	import { minesweeperIconLarge } from '@w2k/minesweeper';
	import { Desktop } from '@w2k/ui';
	import { desktopSlice, windowComponents } from '../root-store.js';
	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={minesweeperIconLarge} />
	<title>w2k</title>
	<meta name="Description" content="w2k desktop" />
</svelte:head>

<W2kGlobal />

<Desktop {desktopSlice} {windowComponents} zoom={2}>
	{@render children?.()}
</Desktop>
