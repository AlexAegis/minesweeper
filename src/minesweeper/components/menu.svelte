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
	import { ButtonType } from '../ui/button-type.enum';
	import Dropdown from '../ui/dropdown.svelte';

	const preset$ = gameSettings$.pipe(map((settings) => ({ ...settings })));

	let contextHasOpenDropdown = false;

	function settingsOkListener(event: CustomEvent<GamePreset>): void {
		minesweeperActions.resetGame.next(event.detail);
		settingsModal.close();
	}
</script>

<div class="ms-menu">
	<Dropdown title={'Game'} bind:contextHasOpenDropdown>
		<Button type={ButtonType.CONTEXT_MENU_ITEM} on:click={() => settingsModal.open()}>
			File
		</Button>
		<hr />
		<Button type={ButtonType.CONTEXT_MENU_ITEM} on:click={() => settingsModal.open()}>
			Settings
		</Button>
	</Dropdown>
	<Button type={ButtonType.TITLE_BAR_MENU_ITEM} on:click={() => highScoreModal.open()}>
		highscore
	</Button>
	<Button type={ButtonType.TITLE_BAR_MENU_ITEM} on:click={() => window.open(homepage, '_blank')}>
		github
	</Button>
</div>

<Modal title="Settings" bind:this={settingsModal}>
	<Settings preset={$preset$} on:ok={settingsOkListener} />
</Modal>

<Modal title="Highscore" bind:this={highScoreModal}>
	<Highscore />
</Modal>

<style>
	.ms-menu {
		height: 16px;
		display: flex;
		height: max-content;
		margin-bottom: 3px;
		margin-top: 1px;
	}

	.ms-menu :global(button:first-letter) {
		text-decoration: underline;
	}
</style>
