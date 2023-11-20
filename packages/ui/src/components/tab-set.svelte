<script lang="ts">
	import type { TabSetTabs } from './tab-set.interface';

	export let tabs: TabSetTabs = {};
	export let selected: string | undefined = Object.keys(tabs)[0];
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<menu role="tablist" class="multirows">
	{#each Object.entries(tabs) as [tabId, { displayName, disabled }]}
		<li role="tab" class:disabled aria-selected="{selected === tabId}">
			<a href="#{tabId}" on:click="{() => (selected = tabId)}"> {displayName}</a>
		</li>
	{/each}
</menu>

<div class="window" role="tabpanel">
	<div class="window-body">
		<slot name="content" tab="{selected}" />
	</div>
</div>
