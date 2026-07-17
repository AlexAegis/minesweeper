<script lang="ts">
	import {
		Button,
		TabSet,
		areDesktopColorSchemesEqual,
		cloneDesktopColorScheme,
		type DesktopColorScheme,
		type DesktopSlice,
		type TabSetTabs,
		type WindowState,
	} from '@w2k/ui';
	import AppearanceSettings from './appearance/appearance-settings.svelte';
	// export let internals!: DisplayPropertiesApp;

	interface Props {
		// export let windowSlice!: DicedWindow;
		desktopSlice: DesktopSlice;
		windowState: WindowState;
	}

	let { desktopSlice, windowState }: Props = $props();

	const tabs: TabSetTabs = {
		background: { displayName: 'Background', disabled: true },
		screenSaver: { displayName: 'Screen Saver', disabled: true },
		appearance: { displayName: 'Appearance', disabled: false },
		web: { displayName: 'Web', disabled: true },
		effects: { displayName: 'Effects', disabled: true },
		settings: { displayName: 'Settings', disabled: true },
	};

	// svelte-ignore state_referenced_locally
	let temporaryScheme: DesktopColorScheme = $state(
		cloneDesktopColorScheme(desktopSlice.activeSchemeData$.value),
	);

	function close() {
		desktopSlice.dicedWindows.remove(windowState.processId);
	}

	function applyScheme() {
		// setSchemeAction updates both the scheme colors and the scheme kind, so
		// applying a built-in scheme's colors also switches to its css class, and
		// custom colors mark the scheme as custom (which is what enables the
		// inline css variables on the desktop).
		desktopSlice.setSchemeAction.next(cloneDesktopColorScheme(temporaryScheme));
	}
	let activeSchemeData$ = $derived(desktopSlice.activeSchemeData$);
	let somethingChanged = $derived(
		!areDesktopColorSchemesEqual($activeSchemeData$, temporaryScheme),
	);
</script>

<div class="content">
	<TabSet {tabs} selected="appearance">
		{#snippet content({ tab })}
			<div>
				{#if tab === 'appearance'}
					<AppearanceSettings bind:temporaryScheme {desktopSlice}></AppearanceSettings>
				{/if}
			</div>
		{/snippet}
	</TabSet>
	<div class="prompt-control">
		<Button
			onclick={() => {
				applyScheme();
				close();
			}}>OK</Button
		>
		<Button onclick={() => close()}>Cancel</Button>
		<Button
			onclick={() => {
				applyScheme();
			}}
			disabled={!somethingChanged}>Apply</Button
		>
	</div>
</div>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		padding: 4px; // TODO: verify
		gap: 4px;
	}

	.prompt-control {
		display: flex;
		justify-content: flex-end;
		gap: 4px; // TODO: verify
	}
</style>
