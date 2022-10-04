<script lang="ts">
	import Window from './window.svelte';

	export let title: string;
	export let isOpen: boolean = false;

	export function open() {
		isOpen = true;
	}

	export function close() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div class="ms-modal" style={$$props.style}>
		<Window {title} on:close={close}>
			<slot />
		</Window>

		<div class="backdrop" on:click={close} />
	</div>
{/if}

<style>
	.ms-modal :global(.ms-window) {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translateX(-50%) translateY(-50%);
		width: 200px;

		padding: 8px;
		z-index: 1000;
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
</style>
