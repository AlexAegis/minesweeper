<script lang="ts">
	import Button from './desktop/components/button.svelte';
	import Desktop from './desktop/desktop.svelte';
	import { debug$ } from './root.store';
</script>

<Desktop>
	<svelte:fragment slot="quickbar">
		<Button class="debug-button" on:click={() => debug$.set(!debug$.value)}>Debug</Button>
	</svelte:fragment>
</Desktop>

<style>
	:global(.debug-button) {
		justify-self: flex-end;
	}
</style>
