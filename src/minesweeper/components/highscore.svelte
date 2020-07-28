<script lang="ts">
	import { won$ } from '../store';

	$: wins = $won$;
</script>

<ol>
	{#each $won$ as win}
		<li>{win?.height} * {win?.width}: {win?.time}</li>
	{:else}No games played yet!{/each}
</ol>
