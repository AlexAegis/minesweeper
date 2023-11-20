<script lang="ts">
	import { Button, TabSet, type TabSetTabs } from '@w2k/ui';

	const tabs: TabSetTabs = {
		background: { displayName: 'Background', disabled: false },
		screenSaver: { displayName: 'Screen Saver', disabled: true },
		appearance: { displayName: 'Appearance', disabled: false },
		web: { displayName: 'Web', disabled: true },
		effects: { displayName: 'Effects', disabled: true },
		settings: { displayName: 'Settings', disabled: true },
	};
</script>

<TabSet {tabs} selected="appearance">
	<div slot="content" let:tab>
		{#if tab === 'background'}
			BGd
		{:else if tab === 'appearance'}
			asf
		{/if}
	</div>
</TabSet>

<Button>OK</Button>
<Button>Cancel</Button>
<Button>Apply</Button>
