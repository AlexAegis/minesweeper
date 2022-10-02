<script lang="ts">
	import { GAME_PRESETS, isTheSamePreset } from '../consts/game-presets.conts';
	import { winHistory$ } from '../store/game.store';
</script>

<ol>
	{#each $winHistory$ as win (win.id)}
		{#if isTheSamePreset(win.preset, GAME_PRESETS.beginner)}
			<li>Beginner: {win.time}s</li>
		{:else if isTheSamePreset(win.preset, GAME_PRESETS.intermediate)}
			<li>Intermediate: {win.time}s</li>
		{:else if isTheSamePreset(win.preset, GAME_PRESETS.expert)}
			<li>Expert: {win.time}s</li>
		{:else}
			<li>
				Custom: {win.time}s ({win.preset.height} * {win.preset.width}, {win.preset
					.mineCount} mines)
			</li>
		{/if}
	{:else}No games played yet!{/each}
</ol>
