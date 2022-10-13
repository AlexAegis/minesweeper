<script lang="ts">
	import { desktopActions, DesktopProgram, programs$ } from './minesweeper/store/desktop.store';
	import Button from './minesweeper/ui/button.svelte';
	import DesktopIcon from './minesweeper/ui/desktop-icon.svelte';
	import Desktop from './minesweeper/ui/desktop.svelte';

	desktopActions.spawnProgram.next(DesktopProgram.MINESWEEPER);
</script>

<Desktop>
	{#each $programs$ as program}
		<DesktopIcon
			title={program}
			on:dblclick={() => desktopActions.spawnProgram.next(program)}
		/>
	{/each}

	<svelte:fragment slot="quickbar">
		<Button class="debug-button">Debug</Button>
		<Button class="debug-button">Debug</Button>
	</svelte:fragment>
</Desktop>

<style>
	:global(.debug-button) {
		justify-self: flex-end;
	}
</style>
