<script lang="ts">
	import Button from './button.svelte';

	export let title: string | undefined;
	export let isOpen: boolean = false;

	export function open() {
		isOpen = true;
	}

	export function close() {
		isOpen = false;
	}

</script>

{#if isOpen}
	<div style={$$props.style} class="panel outset {$$props.class}">
		<div class="top">
			<span>{title}</span>
			<Button on:click={close} style="margin-left: auto;" class="button" aria-label="Close">
				X
			</Button>
		</div>

		<slot />
	</div>

	<div class="backdrop" on:click={close} />
{/if}

<style>
	.panel {
		z-index: 1000;
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translateX(-50%) translateY(-50%);
		width: 200px;

		padding: 8px;
		font-family: monospace;
	}

	.backdrop {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 900;
		height: 100vh;
		width: 100vw;
		background-color: rgba(0, 0, 0, 0.37);
	}
	.top {
		display: flex;
		align-items: center;
	}

</style>
