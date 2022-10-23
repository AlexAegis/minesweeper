<script lang="ts">
	import Button from './desktop/components/button.svelte';
	import DesktopIcon from './desktop/components/desktop-icon.svelte';
	import Desktop from './desktop/desktop.svelte';
	import { desktopActions, programs$ } from './desktop/store/desktop.store';
	import { debug$ } from './root.store';
</script>

<Desktop>
	{#each $programs$ as program}
		<DesktopIcon
			title={program}
			icon={program}
			on:dblclick={() => desktopActions.spawnProgram.next(program)}
		/>
	{/each}

	<svelte:fragment slot="quickbar">
		<Button class="debug-button" on:click={() => debug$.set(!debug$.value)}>Debug</Button>
	</svelte:fragment>
</Desktop>

<style>
	:global(.debug-button) {
		justify-self: flex-end;
	}
</style>
