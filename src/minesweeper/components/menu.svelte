<script lang="ts">
	import { homepage, version } from '../../../package.json';
	import Settings from '../forms/settings.form.svelte';
	import { height$, mineCount$, width$ } from '../store';
	import Button from './button.svelte';
	import Modal from './modal.svelte';

	let modal: Modal;
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
	<Button style="margin: 4px" on:click={() => modal.open()}>settings</Button>
	<Button style="margin: 4px" on:click={() => window.open(homepage, '_blank')}>github</Button>
	<span>v{version}</span>
</div>

<Modal bind:this={modal}>
	<Settings bind:width={$width$} bind:height={$height$} bind:mineCount={$mineCount$} />
</Modal>
