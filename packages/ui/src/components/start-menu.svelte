<script lang="ts">
	import type { CoordinateLike } from '@w2k/common';
	import { PACKAGE_NAME_AND_VERSION, documentPointerUp$, packageMetadata } from '@w2k/core';
	import { filter, map } from 'rxjs';
	import { onDestroy } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import {
		w2kDisplaySettingsIconLarge,
		w2kProgramsIconLarge,
		w2kScanIconLarge,
		w2kShutdownIconLarge,
	} from '../assets/icons';
	import { githubIcon } from '../assets/misc';
	import { readGlobal } from '../helpers/w2k-globals';
	import type { DesktopSlice } from '../store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import ContextMenu from './context-menu.svelte';
	import Image from './image.svelte';

	export let desktopSlice: DesktopSlice;
	export let startButton: HTMLElement;

	let startMenu: HTMLElement;

	$: programKeys$ = desktopSlice.dicedPrograms.keys$;
	$: activeSchemeKind$ = desktopSlice.activeSchemeKind$;
	$: debug$ = desktopSlice.desktop$.internals.debug$;

	let contextMenuPosition: CoordinateLike | undefined = undefined;

	const closeEffect = desktopSlice.desktop$.createEffect(
		documentPointerUp$.pipe(
			filter((event) => {
				if (event.button !== 0) {
					return false;
				}
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return (
					(!elementsUnderPointer.includes(startMenu) &&
						!elementsUnderPointer.includes(startButton)) ||
					(elementsUnderPointer.includes(startMenu) &&
						elementsUnderPointer.some((element) => element.nodeName === 'BUTTON'))
				);
			}),
			map(() => desktopSlice.startMenuOpen$.setAction.makePacket(false)),
		),
	);

	onDestroy(() => {
		closeEffect.unsubscribe();
	});

	const iconSize = 32;
</script>

<div class="start-menu-container">
	<div bind:this="{startMenu}" class="start-menu window">
		<div class="banner">
			<div>{PACKAGE_NAME_AND_VERSION}</div>
		</div>
		<div class="content">
			{#each $programKeys$ as programKey}
				<Observer observable="{desktopSlice.dicedPrograms.get(programKey)}" let:next>
					<Button
						class="flat"
						look="{ButtonLook.START_MENU_ITEM}"
						on:click="{() => {
							desktopSlice.desktop$.internals.actions.spawnProgram.next(programKey);
						}}"
						on:contextmenu="{(event) => {
							contextMenuPosition = contextMenuPosition
								? undefined
								: {
										x: event.pageX / readGlobal('w2kZoom'),
										y: event.pageY / readGlobal('w2kZoom'),
								  };
						}}"
					>
						<Image
							alt="{next.name}"
							src="{next.icon}"
							height="{iconSize}"
							width="{iconSize}"
						/>
						{next.initialWindowState.title}
					</Button>

					<ContextMenu bind:position="{contextMenuPosition}">
						<Button
							look="{ButtonLook.CONTEXT_MENU_ITEM}"
							on:click="{() => {
								desktopSlice.shortcuts$.internals.shortcutsActions.spawnShortcut.next(
									next,
								);
							}}"
						>
							Create Shortcut
						</Button>
					</ContextMenu>
				</Observer>
			{/each}

			<hr />

			<slot />
			{#if $$slots.default}
				<hr />
			{/if}

			<Button
				look="{ButtonLook.START_MENU_ITEM}"
				class="flat"
				on:fire="{() => {
					alert('Under Construction');
				}}"
			>
				<Image height="{iconSize}" width="{iconSize}" src="{w2kProgramsIconLarge}" />
				Programs
			</Button>

			<Button
				look="{ButtonLook.START_MENU_ITEM}"
				class="flat"
				on:fire="{() => {
					desktopSlice.toggleActiveSchemeKindAction.next(undefined);
				}}"
			>
				<Image height="{iconSize}" width="{iconSize}" src="{w2kDisplaySettingsIconLarge}" />
				Switch to
				{#if $activeSchemeKind$ === 'w98'}
					w2k
				{:else}
					w98
				{/if}
				theme
			</Button>

			<Button
				look="{ButtonLook.START_MENU_ITEM}"
				class="flat"
				on:fire="{() => {
					debug$.set(!debug$.value);
				}}"
			>
				<Image height="{iconSize}" width="{iconSize}" src="{w2kScanIconLarge}" />
				{#if $debug$}
					Disable
				{:else}
					Enable
				{/if}
				Debug Mode
			</Button>

			<Button
				look="{ButtonLook.START_MENU_ITEM}"
				class="flat"
				on:fire="{() => window.open(packageMetadata.homepage, '_blank')}"
			>
				<Image height="{iconSize}" width="{iconSize}" src="{githubIcon}" />
				Github
			</Button>

			<hr />

			<Button
				look="{ButtonLook.START_MENU_ITEM}"
				class="flat"
				on:fire="{() => {
					confirm('Sure?') && window.close();
				}}"
			>
				<Image height="{iconSize}" width="{iconSize}" src="{w2kShutdownIconLarge}" />
				Shut down...
			</Button>
		</div>
	</div>
</div>
