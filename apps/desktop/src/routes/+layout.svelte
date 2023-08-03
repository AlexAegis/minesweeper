<script lang="ts">
	import { W2kGlobal } from '@w2k/css';
	import minesweeperIconLarge from '../assets/minesweeper/minesweeper-icon-large.png';
	import Desktop from '../desktop/desktop.svelte';
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="{minesweeperIconLarge}" />
	<title>Minesweeper</title>
	<meta name="Description" content="Minesweeper" />
</svelte:head>

<W2kGlobal />

<Desktop>
	<slot />
</Desktop>
