<script lang="ts">
	import { filter, map } from 'rxjs';
	import { onDestroy } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import {
		PACKAGE_NAME_AND_VERSION,
		debug$,
		documentPointerUp$,
		packageMetadata,
	} from '../../root.store';
	import {
		activeSchemeKind$,
		desktop$,
		dicedPrograms,
		startMenuOpen$,
		toggleActiveSchemeKindAction,
	} from '../store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import Image from './image.svelte';

	let startMenu: HTMLElement;
	export let startButton: HTMLElement;

	import githubIcon from '../../assets/desktop/github.png';
	import displaySettingsIcon from '../../assets/desktop/w2k-display-settings-icon-large.png';
	import programsIcon from '../../assets/desktop/w2k-programs-icon-large.png';
	import scanIcon from '../../assets/desktop/w2k-scan-icon-large.png';
	import shutdownIcon from '../../assets/desktop/w2k-shutdown-icon-large.png';

	$: programKeys$ = dicedPrograms.keys$;

	const closeEffect = desktop$.createEffect(
		documentPointerUp$.pipe(
			filter((event) => {
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return (
					(!elementsUnderPointer.includes(startMenu) &&
						!elementsUnderPointer.includes(startButton)) ||
					(elementsUnderPointer.includes(startMenu) &&
						elementsUnderPointer.some((element) => element.nodeName === 'BUTTON'))
				);
			}),
			map(() => startMenuOpen$.setAction.makePacket(false)),
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
			<slot />

			{#each $programKeys$ as programKey}
				<Observer observable="{dicedPrograms.get(programKey)}" let:next>
					<Button
						class="flat"
						look="{ButtonLook.START_MENU_ITEM}"
						on:fire="{() => {
							desktop$.internals.actions.spawnProgram.next(programKey);
						}}"
						on:alternativeFire="{() => {
							console.log('TODO: create icon', programKey);
						}}"
					>
						<Image
							alt="{next.name}"
							src="{next.icon}"
							height="{iconSize}"
							width="{iconSize}"
						/>
						{next.title}
					</Button>
				</Observer>
			{/each}

			<hr />

			<Button
				look="{ButtonLook.START_MENU_ITEM}"
				class="flat"
				on:fire="{() => {
					alert('Under Construction');
				}}"
			>
				<Image height="{iconSize}" width="{iconSize}" src="{programsIcon}" />
				Programs
			</Button>

			<Button
				look="{ButtonLook.START_MENU_ITEM}"
				class="flat"
				on:fire="{() => {
					toggleActiveSchemeKindAction.next(undefined);
				}}"
			>
				<Image height="{iconSize}" width="{iconSize}" src="{displaySettingsIcon}" />
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
				<Image height="{iconSize}" width="{iconSize}" src="{scanIcon}" />
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
				<Image height="{iconSize}" width="{iconSize}" src="{shutdownIcon}" />
				Shut down...
			</Button>
		</div>
	</div>
</div>

<style lang="scss">
	hr {
		margin-top: auto;
	}
</style>
