<script lang="ts">
	import Window from './window.svelte';

	export let title: string;
	export let isOpen: boolean = false;

	export function open() {
		isOpen = true;
	}

	export function close(event?: MouseEvent) {
		event?.preventDefault();
		console.log(event);
		if ((event?.target as Element)?.className.includes('ms-modal') ?? true) {
			isOpen = false;
		}
	}
</script>

{#if isOpen}
	<div class="ms-modal" style={$$props.style} on:click={close}>
		<Window {title} on:close={() => close()}>
			<slot />
		</Window>
	</div>
{/if}

<style lang="scss">
	.ms-modal {
		position: absolute;
		position: fixed;
		height: 100%;
		width: 100%;
		left: 0;
		top: 0;
		z-index: 900;

		background-color: rgba(0, 0, 0, 0.37);

		:global(.ms-window) {
			position: relative;
			z-index: 1000;
		}
	}
</style>
