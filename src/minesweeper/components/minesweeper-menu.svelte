<script lang="ts">
	import { homepage } from '../../../package.json';
	import Settings from './settings.form.svelte';

	import Button from '../ui/button.svelte';
	import Modal from '../ui/modal.svelte';
	import Highscore from './highscore.svelte';

	let customGameModal: Modal;
	let highScoreModal: Modal;

	import { map } from 'rxjs';
	import Observer from 'svelte-rxjs-observer/src/observer.svelte';
	import type { GamePreset } from '../core';
	import { CLASSIC_GAME_PRESETS, type MinesweeperGame } from '../store';

	import { ButtonLook } from '../ui/button-look.enum';
	import Dropdown from '../ui/dropdown.svelte';
	import type { BaseWindowState } from '../ui/window-state.interface';

	export let windowState: BaseWindowState;
	export let internals: MinesweeperGame;

	$: preset$ = internals.gameSettings$.pipe(map((settings) => ({ ...settings })));
	$: isGameSettingsNotAPreset$ = internals.isGameSettingsNotAPreset$;
	$: presets$ = internals.presets$;
	$: highscoreEntries$ = internals.highscoreEntries$;

	let active: string | undefined;

	function settingsOkListener(event: CustomEvent<GamePreset>): void {
		internals.minesweeperActions.resetGame.next(event.detail);
		customGameModal.close();
	}
</script>

<Dropdown title="Game" hotkeyLetter={'G'} bind:active>
	<Button
		look={ButtonLook.CONTEXT_MENU_ITEM}
		on:click={() => internals.minesweeperActions.resetGame.next()}
		contextHasToggleable={true}
	>
		New
	</Button>
	<hr />
	{#each Object.entries(CLASSIC_GAME_PRESETS) as [key, preset]}
		<Observer observable={internals.isGameSettingsAPreset$(preset)} let:next>
			<Button
				look={ButtonLook.CONTEXT_MENU_ITEM}
				toggled={next}
				contextHasToggleable={true}
				on:click={() => internals.minesweeperActions.resetGame.next(preset)}
			>
				{key}
			</Button>
		</Observer>
	{/each}

	<Button
		look={ButtonLook.CONTEXT_MENU_ITEM}
		on:click={() => customGameModal.open(windowState)}
		toggled={$isGameSettingsNotAPreset$}
		contextHasToggleable={true}
	>
		Custom...
	</Button>
	<Button
		look={ButtonLook.CONTEXT_MENU_ITEM}
		on:click={() => highScoreModal.open(windowState)}
		contextHasToggleable={true}
	>
		Highscore
	</Button>

	<Observer observable={internals.cheating$} let:next>
		<Button
			look={ButtonLook.CONTEXT_MENU_ITEM}
			on:click={() => internals.minesweeperActions.cheating.next(!next)}
			contextHasToggleable={true}
		>
			{#if !next}
				Enable
			{:else}
				Disable
			{/if}
			Cheats
		</Button>
	</Observer>
</Dropdown>
<Dropdown title={'Help'} hotkeyLetter={'H'} bind:active>
	<Button look={ButtonLook.CONTEXT_MENU_ITEM} on:click={() => window.open(homepage, '_blank')}>
		Github
	</Button>
	<hr />
	<Button look={ButtonLook.CONTEXT_MENU_ITEM}>About Minesweeper...</Button>
</Dropdown>

<Modal
	bind:this={customGameModal}
	windowState={{ fitContent: true, title: 'Custom Field', resizable: false }}
>
	<Settings
		{presets$}
		preset={$preset$}
		on:ok={settingsOkListener}
		on:cancel={() => customGameModal.close()}
	/>
</Modal>

<Modal
	bind:this={highScoreModal}
	windowState={{ fitContent: false, title: 'Highscore', height: 240 }}
>
	<Highscore {highscoreEntries$} />
</Modal>

<style lang="scss">
</style>
