<script lang="ts">
	import { homepage, version } from '../../../package.json';
	import Button from './button.svelte';
</script>

<style>
	div {
		display: flex;
		height: max-content;
	}

	span {
		font-family: monospace;
		align-self: center;
		margin-left: auto;
		margin-right: 4px;
	}
</style>

<div>
	<Button>game</Button>
	<Button on:click={() => window.open(homepage, '_blank')}>github</Button>
	<span>v{version}</span>
</div>
