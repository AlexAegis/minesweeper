<script lang="ts">
	import Settings from './settings.form.svelte';

	import { Button, ModalDialogWindow } from '@w2k/ui';
	import Highscore from './highscore.svelte';

	let customGameModal: ModalDialogWindow;
	let highScoreModal: ModalDialogWindow;
	let aboutModal: ModalDialogWindow;

	import { map } from 'rxjs';
	import type { GamePreset } from '../interfaces';
	import { CLASSIC_GAME_PRESETS, type MinesweeperGame } from '../store';

	import { packageMetadata } from '@w2k/core';
	import type { BaseWindowState } from '@w2k/ui';
	import { ButtonLook, Dropdown } from '@w2k/ui';
	import { createEventDispatcher } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import AboutMinesweeper from './about-minesweeper.svelte';

	export let windowState: BaseWindowState;
	export let internals: MinesweeperGame;

	let dispatch = createEventDispatcher<{ close: undefined }>();

	$: preset$ = internals.gameSettings$?.pipe(map((settings) => ({ ...settings })));
	$: isGameSettingsNotAPreset$ = internals.isGameSettingsNotAPreset$;
	$: presets$ = internals.presets$;
	$: highscoreEntries$ = internals.highscoreEntries$;

	let active: string | undefined;

	function settingsSubmit(event: CustomEvent<GamePreset>): void {
		internals.minesweeperActions.resetGame.next(event.detail);
		customGameModal.close();
	}
</script>

<Dropdown title="Game" hotkeyLetter="{'G'}" bind:active>
	<Button
		look="{ButtonLook.CONTEXT_MENU_ITEM}"
		on:click="{() => internals.minesweeperActions.resetGame.next(undefined)}"
	>
		New
	</Button>
	<hr />
	{#each Object.entries(CLASSIC_GAME_PRESETS) as [key, preset]}
		<Observer observable="{internals.isGameSettingsAPreset$(preset)}" let:next>
			<Button
				look="{ButtonLook.CONTEXT_MENU_ITEM}"
				toggled="{next}"
				on:click="{() => {
					internals.minesweeperActions.resetGame.next(preset);
				}}"
			>
				{key}
			</Button>
		</Observer>
	{/each}
	<Button
		look="{ButtonLook.CONTEXT_MENU_ITEM}"
		on:click="{() => customGameModal.open(windowState)}"
		toggled="{$isGameSettingsNotAPreset$}"
	>
		Custom...
	</Button>
	<hr />

	<Observer observable="{internals.cheating$}" let:next>
		<Button
			look="{ButtonLook.CONTEXT_MENU_ITEM}"
			on:click="{() => {
				internals.minesweeperActions.cheating.next(!next);
			}}"
			toggled="{next}"
		>
			{#if !next}
				Enable
			{:else}
				Disable
			{/if}
			Cheats
		</Button>
	</Observer>

	<Observer observable="{internals.unlockedScheme$}" let:next>
		<Button
			look="{ButtonLook.CONTEXT_MENU_ITEM}"
			on:click="{() => {
				internals.unlockedScheme$.set(!next);
			}}"
			toggled="{next}"
			title="Regardless of your UI scheme, Minesweeper always looked like the 98/Classic scheme. Here you can turn it off and see how it would like with the system scheme."
		>
			Unlock Color Scheme
		</Button>
	</Observer>

	<Observer observable="{internals.unlockedResize$}" let:next>
		<Button
			look="{ButtonLook.CONTEXT_MENU_ITEM}"
			on:click="{() => {
				internals.unlockedResize$.set(!next);
			}}"
			toggled="{next}"
			title="Minesweeper is not resizeable by default. How about changing that?"
		>
			Unlock Resize
		</Button>
	</Observer>

	<hr />

	<Button
		look="{ButtonLook.CONTEXT_MENU_ITEM}"
		on:click="{() => highScoreModal.open(windowState)}"
	>
		Best times...
	</Button>
	<hr />

	<Button
		look="{ButtonLook.CONTEXT_MENU_ITEM}"
		on:click="{() => {
			dispatch('close');
		}}"
	>
		Quit
	</Button>
</Dropdown>
<Dropdown title="{'Help'}" hotkeyLetter="{'H'}" bind:active>
	<Button
		look="{ButtonLook.CONTEXT_MENU_ITEM}"
		on:click="{() => window.open(packageMetadata.homepage, '_blank')}"
	>
		Github
	</Button>
	<hr />
	<Button look="{ButtonLook.CONTEXT_MENU_ITEM}" on:click="{() => aboutModal.open(windowState)}"
		>About Minesweeper...</Button
	>
</Dropdown>

<ModalDialogWindow
	bind:this="{customGameModal}"
	windowState="{{ fitContent: true, title: 'Custom Field', resizable: false }}"
>
	<Settings
		{presets$}
		preset="{$preset$}"
		on:submit="{settingsSubmit}"
		on:cancel="{() => customGameModal.close()}"
	/>
</ModalDialogWindow>

<ModalDialogWindow
	bind:this="{highScoreModal}"
	windowState="{{ fitContent: false, title: 'Highscore', height: 240 }}"
>
	<Highscore
		{highscoreEntries$}
		isClearingEnabled="{internals !== undefined}"
		on:clear="{() => internals.winHistory$.set([])}"
	/>
</ModalDialogWindow>

<ModalDialogWindow
	bind:this="{aboutModal}"
	windowState="{{ fitContent: true, title: 'About', resizable: true }}"
>
	<AboutMinesweeper />
</ModalDialogWindow>
