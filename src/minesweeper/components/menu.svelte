<script lang="ts">
	import { homepage } from '../../../package.json';
	import Settings from '../forms/settings.form.svelte';
	import { height$, mineCount$, width$ } from '../store';
	import Button from './button.svelte';
	import Highscore from './highscore.svelte';
	import Modal from './modal.svelte';

	let settingsModal: Modal;
	let highScoreModal: Modal;
</script>

<style>
	div {
		display: flex;
		height: max-content;
	}

	span {
		font-family: monospace;
		align-self: center;
		margin-left: auto;
		margin-right: 4px;
	}
</style>

<div>
	<Button style="margin: 1px; border-style: none;" on:click={() => settingsModal.open()}>
		settings
	</Button>
	<Button style="margin: 1px; border-style: none;" on:click={() => highScoreModal.open()}>
		highscore
	</Button>
	<Button
		style="margin-left:auto; border-style: none;"
		on:click={() => window.open(homepage, '_blank')}>
		github
	</Button>
</div>

<Modal title="Settings" bind:this={settingsModal}>
	<Settings
		bind:width={$width$}
		bind:height={$height$}
		bind:mineCount={$mineCount$}
		on:done={() => settingsModal.close()} />
</Modal>

<Modal title="Highscore" style=" width: 300px; height: 400px;" bind:this={highScoreModal}>
	<Highscore />
</Modal>
