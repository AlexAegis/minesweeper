<script lang="ts">
	import { winHistory$ } from '../store';
</script>

<ol>
	{#each $winHistory$ as win}
		<li>Custom: {win?.mineCount}, {win?.height} * {win?.width} in {win?.time}s</li>
	{:else}No games played yet!{/each}
</ol>
