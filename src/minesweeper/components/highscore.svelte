<script lang="ts">
	import { isTheSamePreset, presets, winHistory$ } from '../store';

</script>

<ol>
	{#each $winHistory$ as win (win.id)}
		{#if isTheSamePreset(win, presets.beginner)}
			<li>Beginner: {win.time}s</li>
		{:else if isTheSamePreset(win, presets.intermediate)}
			<li>Intermediate: {win.time}s</li>
		{:else if isTheSamePreset(win, presets.expert)}
			<li>Expert: {win.time}s</li>
		{:else}
			<li>Custom: {win.time}s ({win.height} * {win.width}, {win.mineCount} mines)</li>
		{/if}
	{:else}No games played yet!{/each}
</ol>
