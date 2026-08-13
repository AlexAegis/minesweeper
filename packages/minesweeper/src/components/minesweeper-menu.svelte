<script lang="ts">
	import Settings from './settings-form.svelte';

	import { Button, ModalDialogWindow, formatPid, w2kCheckmark } from '@w2k/ui';
	import Highscore from './highscore.svelte';

	let customGameModal: ModalDialogWindow = $state()!;
	let highScoreModal: ModalDialogWindow = $state()!;
	let aboutModal: ModalDialogWindow = $state()!;

	import { map } from 'rxjs';
	import type { GamePreset } from '../interfaces';
	import { CLASSIC_GAME_PRESETS, type MinesweeperGame } from '../store';

	import { packageMetadata } from '@w2k/core';
	import type { BaseWindowState } from '@w2k/ui';
	import { ButtonLook, Dropdown } from '@w2k/ui';
	import { Observer } from 'svelte-rxjs-observer';
	import AboutMinesweeper from './about-minesweeper.svelte';

	interface Props {
		windowState: BaseWindowState;
		internals: MinesweeperGame;
		onClose?: (() => void) | undefined;
	}

	let { windowState, internals, onClose = undefined }: Props = $props();

	let preset$ = $derived(internals.gameSettings$?.pipe(map((settings) => ({ ...settings }))));
	let isGameSettingsNotAPreset$ = $derived(internals.isGameSettingsNotAPreset$);
	let presets$ = $derived(internals.presets$);
	let highscoreEntries$ = $derived(internals.highscoreEntries$);

	let active: string | undefined = $state();

	function settingsSubmit(preset: GamePreset): void {
		internals.minesweeperActions.resetGame.next(preset);
		customGameModal.close();
	}

	function openModal(modal: ModalDialogWindow) {
		const windowElement = document.querySelector<HTMLElement>(
			'#' + formatPid(windowState.processId, 'window'),
		);

		modal.open(windowElement);
	}
</script>

<Dropdown title="Game" hotkeyLetter={'G'} bind:active>
	<Button
		look={ButtonLook.CONTEXT_MENU_ITEM}
		onclick={() => internals.minesweeperActions.resetGame.next(undefined)}
	>
		New
	</Button>
	<hr />
	{#each Object.entries(CLASSIC_GAME_PRESETS) as [key, preset] (key)}
		<Observer observable={internals.isGameSettingsAPreset$(preset)}>
			{#snippet children({ next }: { next: boolean })}
				<Button
					look={ButtonLook.CONTEXT_MENU_ITEM}
					icon={next ? w2kCheckmark : ''}
					onclick={() => {
						internals.minesweeperActions.resetGame.next(preset);
					}}
				>
					{key}
				</Button>
			{/snippet}
		</Observer>
	{/each}
	<Button
		look={ButtonLook.CONTEXT_MENU_ITEM}
		onclick={() => openModal(customGameModal)}
		icon={$isGameSettingsNotAPreset$ ? w2kCheckmark : ''}
	>
		Custom...
	</Button>
	<hr />

	<Observer observable={internals.cheating$}>
		{#snippet children({ next }: { next: boolean })}
			<Button
				look={ButtonLook.CONTEXT_MENU_ITEM}
				onclick={() => {
					internals.minesweeperActions.cheating.next(!next);
				}}
				icon={next ? w2kCheckmark : ''}
			>
				{#if !next}
					Enable
				{:else}
					Disable
				{/if}
				Cheats
			</Button>
		{/snippet}
	</Observer>

	<Observer observable={internals.unlockedScheme$}>
		{#snippet children({ next }: { next: boolean })}
			<Button
				look={ButtonLook.CONTEXT_MENU_ITEM}
				onclick={() => {
					internals.unlockedScheme$.set(!next);
				}}
				icon={next ? w2kCheckmark : ''}
				title="Regardless of your UI scheme, Minesweeper always looked like the 98/Classic scheme. Here you can turn it off and see how it would like with the system scheme."
			>
				Unlock Color Scheme
			</Button>
		{/snippet}
	</Observer>

	<Observer observable={internals.unlockedResize$}>
		{#snippet children({ next }: { next: boolean })}
			<Button
				look={ButtonLook.CONTEXT_MENU_ITEM}
				onclick={() => {
					internals.unlockedResize$.set(!next);
				}}
				icon={next ? w2kCheckmark : ''}
				title="Minesweeper is not resizeable by default. How about changing that?"
			>
				Unlock Resize
			</Button>
		{/snippet}
	</Observer>

	<hr />

	<Button look={ButtonLook.CONTEXT_MENU_ITEM} onclick={() => openModal(highScoreModal)}>
		Best times...
	</Button>
	<hr />

	<Button
		look={ButtonLook.CONTEXT_MENU_ITEM}
		onclick={() => {
			onClose?.();
		}}
	>
		Exit
	</Button>
</Dropdown>
<Dropdown title={'Help'} hotkeyLetter={'H'} bind:active>
	<Button
		look={ButtonLook.CONTEXT_MENU_ITEM}
		onclick={() => window.open(packageMetadata.homepage, '_blank')}
	>
		Github
	</Button>
	<hr />
	<Button look={ButtonLook.CONTEXT_MENU_ITEM} onclick={() => openModal(aboutModal)}>
		About Minesweeper...
	</Button>
</Dropdown>

<ModalDialogWindow
	bind:this={customGameModal}
	windowState={{ fitContent: true, title: 'Custom Field', resizable: false }}
>
	<Settings
		{presets$}
		preset={$preset$}
		onSubmit={settingsSubmit}
		onCancel={() => customGameModal.close()}
	/>
</ModalDialogWindow>

<ModalDialogWindow
	bind:this={highScoreModal}
	windowState={{ fitContent: false, title: 'Highscore', height: 240 }}
>
	<Highscore
		{highscoreEntries$}
		isClearingEnabled={internals !== undefined}
		onClear={() => internals.winHistory$.set([])}
	/>
</ModalDialogWindow>

<ModalDialogWindow
	bind:this={aboutModal}
	windowState={{ fitContent: true, title: 'About', resizable: true }}
>
	<AboutMinesweeper />
</ModalDialogWindow>
