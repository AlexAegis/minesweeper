<script lang="ts">
	import { homepage } from '../../../package.json';
	import Settings from '../forms/settings.form.svelte';

	import Button from '../ui/button.svelte';
	import Modal from '../ui/modal.svelte';
	import Highscore from './highscore.svelte';

	let settingsModal: Modal;
	let highScoreModal: Modal;

	import { map } from 'rxjs';
	import type { GamePreset } from '../consts/game-presets.conts';
	import { gameSettings$, minesweeperActions } from '../store/game.store';

	const preset$ = gameSettings$.pipe(map((settings) => ({ ...settings })));

	function settingsOkListener(event: CustomEvent<GamePreset>): void {
		minesweeperActions.resetGame.next(event.detail);
		settingsModal.close();
	}
</script>

<div>
	<Button style="margin: 1px; border-style: none;" on:click={() => settingsModal.open()}>
		settings
	</Button>
	<Button style="margin: 1px; border-style: none;" on:click={() => highScoreModal.open()}>
		highscore
	</Button>
	<Button
		style="margin-left:auto; border-style: none;"
		on:click={() => window.open(homepage, '_blank')}
	>
		github
	</Button>
</div>

<Modal title="Settings" bind:this={settingsModal}>
	<Settings preset={$preset$} on:ok={settingsOkListener} />
</Modal>

<Modal title="Highscore" style=" width: 300px; height: 400px;" bind:this={highScoreModal}>
	<Highscore />
</Modal>

<style>
	div {
		display: flex;
		height: max-content;
	}
</style>
