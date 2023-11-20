<script lang="ts">
	import { Button, TabSet, type DesktopSlice, type TabSetTabs, type WindowState } from '@w2k/ui';
	import AppearanceSettings from './appearance/appearance-settings.svelte';
	// export let internals!: DisplayPropertiesApp;
	// export let windowSlice!: DicedWindow;
	export let desktopSlice!: DesktopSlice;
	export let windowState!: WindowState;

	desktopSlice.activeScheme$.internals;

	const somethingChanged = false; // TODO

	const tabs: TabSetTabs = {
		background: { displayName: 'Background', disabled: true },
		screenSaver: { displayName: 'Screen Saver', disabled: true },
		appearance: { displayName: 'Appearance', disabled: false },
		web: { displayName: 'Web', disabled: true },
		effects: { displayName: 'Effects', disabled: true },
		settings: { displayName: 'Settings', disabled: true },
	};
</script>

<div class="content">
	<TabSet {tabs} selected="appearance">
		<div slot="content" let:tab>
			{#if tab === 'appearance'}
				<AppearanceSettings></AppearanceSettings>
			{/if}
		</div>
	</TabSet>
	<div class="prompt-control">
		<Button>OK</Button>
		<Button on:click="{() => desktopSlice.dicedWindows.remove(windowState.processId)}">
			Cancel
		</Button>
		<Button disabled="{!somethingChanged}">Apply</Button>
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
