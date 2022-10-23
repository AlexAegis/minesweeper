<script lang="ts">
	import { filter, map } from 'rxjs';
	import { onDestroy } from 'svelte';
	import { Observer } from 'svelte-rxjs-observer';
	import {
		debug$,
		documentPointerdown$,
		packageMetadata,
		PACKAGE_NAME_AND_VERSION,
	} from '../../root.store';
	import { desktop$, dicedPrograms, startMenuOpen$ } from '../store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';
	import Image from './image.svelte';

	let startMenu: HTMLElement;
	export let startButton: HTMLElement;

	import githubIcon from '../../assets/desktop/github.png';

	$: programKeys$ = dicedPrograms.keys$;

	const closeEffect = desktop$.createEffect(
		documentPointerdown$.pipe(
			filter((event) => {
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return (
					(!elementsUnderPointer.includes(startMenu) &&
						!elementsUnderPointer.includes(startButton)) ||
					(elementsUnderPointer.includes(startMenu) &&
						elementsUnderPointer.filter((element) => element.nodeName === 'BUTTON')
							.length > 0)
				);
			}),
			map(() => startMenuOpen$.setAction.makePacket(false))
		)
	);

	onDestroy(() => closeEffect.unsubscribe());
</script>

<div bind:this={startMenu} class="start-menu window">
	<div class="title">
		<div>{PACKAGE_NAME_AND_VERSION}</div>
	</div>
	<div class="content">
		<slot />

		{#each $programKeys$ as programKey}
			<Observer observable={dicedPrograms.get(programKey)} let:next>
				<Button
					look={ButtonLook.START_MENU_ITEM}
					on:fire={() => desktop$.internals.actions.spawnProgram.next(programKey)}
					on:alternativeFire={() => console.log('TODO: create icon', programKey)}
				>
					<Image alt={next.name} src={next.icon} height={28} width={28} />
					{next.title}
				</Button>
			</Observer>
		{/each}

		<hr />

		<Button look={ButtonLook.START_MENU_ITEM} on:fire={() => debug$.set(!debug$.value)}>
			<Image height={28} width={28} />
			{#if $debug$}
				Disable
			{:else}
				Enable
			{/if}
			Debug Mode
		</Button>

		<Button
			look={ButtonLook.START_MENU_ITEM}
			on:fire={() => window.open(packageMetadata.homepage, '_blank')}
		>
			<Image height={28} width={28} src={githubIcon} />
			Github
		</Button>

		<Button
			look={ButtonLook.START_MENU_ITEM}
			on:fire={() => confirm('Sure?') && window.close()}
		>
			<Image height={28} width={28} />
			Shut down...
		</Button>
	</div>
</div>

<style lang="scss">
	.start-menu {
		z-index: 1000;

		width: fit-content;

		display: flex;
		position: fixed;
		bottom: 32px;

		.title {
			display: flex;
			align-items: flex-end;

			width: 20px;

			background: linear-gradient(black, blue);

			div {
				color: white;
				overflow: hidden;
				justify-self: end;
				align-self: end;
				font-weight: bold;
				flex-flow: nowrap;
				text-overflow: ellipsis;
				writing-mode: vertical-lr;
				transform: rotate(180deg);
				text-orientation: sideways;
				width: 100%;
				/* margin-top: 8px; */
				padding: 4px;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
	}
</style>
