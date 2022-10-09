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
	import {
		CLASSIC_GAME_PRESETS,
		gameSettings$,
		isGameSettingsAPreset$,
		isGameSettingsNotAPreset$,
		minesweeperActions,
	} from '../store/game.store';
	import { debug$ } from '../store/root.store';
	import { ButtonLook } from '../ui/button-look.enum';
	import Dropdown from '../ui/dropdown.svelte';

	const preset$ = gameSettings$.pipe(map((settings) => ({ ...settings })));

	let active: string | undefined;

	function settingsOkListener(event: CustomEvent<GamePreset>): void {
		minesweeperActions.resetGame.next(event.detail);
		customGameModal.close();
	}
</script>

<div class="ms-menu">
	<Dropdown title="Game" hotkeyLetter={'G'} bind:active>
		<Button
			look={ButtonLook.CONTEXT_MENU_ITEM}
			on:click={() => minesweeperActions.resetGame.next()}
			contextHasToggleable={true}
		>
			New
		</Button>
		<hr />
		{#each Object.entries(CLASSIC_GAME_PRESETS) as [key, preset]}
			<Observer observable={isGameSettingsAPreset$(preset)} let:next>
				<Button
					look={ButtonLook.CONTEXT_MENU_ITEM}
					toggled={next}
					contextHasToggleable={true}
					on:click={() => {
						minesweeperActions.resetGame.next(preset);
					}}
				>
					{key}
				</Button>
			</Observer>
		{/each}

		<Button
			look={ButtonLook.CONTEXT_MENU_ITEM}
			on:click={() => customGameModal.open()}
			toggled={$isGameSettingsNotAPreset$}
			contextHasToggleable={true}
		>
			Custom...
		</Button>
		<Button
			look={ButtonLook.CONTEXT_MENU_ITEM}
			on:click={() => highScoreModal.open()}
			contextHasToggleable={true}
		>
			Highscore
		</Button>

		<Observer observable={debug$} let:next>
			<Button
				look={ButtonLook.CONTEXT_MENU_ITEM}
				on:click={() => debug$.set(!next)}
				contextHasToggleable={true}
			>
				{#if !next}
					Enable
				{:else}
					Disable
				{/if}
				Debug
			</Button>
		</Observer>
	</Dropdown>
	<Dropdown title={'Help'} hotkeyLetter={'H'} bind:active>
		<Button
			look={ButtonLook.CONTEXT_MENU_ITEM}
			on:click={() => window.open(homepage, '_blank')}
		>
			Github
		</Button>
		<hr />
		<Button look={ButtonLook.CONTEXT_MENU_ITEM}>About Minesweeper...</Button>
	</Dropdown>
</div>

<Modal title="Custom Field" bind:this={customGameModal}>
	<Settings
		preset={$preset$}
		on:ok={settingsOkListener}
		on:cancel={() => customGameModal.close()}
	/>
</Modal>

<Modal title="Highscore" bind:this={highScoreModal}>
	<Highscore />
</Modal>

<style lang="scss">
	.ms-menu {
		height: 16px;
		display: flex;
		height: max-content;

		:global(button:first-letter) {
			text-transform: uppercase;
		}
	}
</style>
