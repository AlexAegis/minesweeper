<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let backdropCanClose = true;
	export let isOpen = false;
	export let darkBackdrop = false;

	const dispatcher = createEventDispatcher<{
		error: undefined;
	}>();

	export function open() {
		isOpen = true;
	}

	export function close(_event?: CustomEvent<undefined>) {
		// Let stuff clear itself
		setTimeout(() => {
			isOpen = false;
		}, 0);
	}

	function backdropClick(event: MouseEvent) {
		if (backdropCanClose) {
			close();
		} else if ((event.target as Element).className.includes('modal')) {
			dispatcher('error');
		}
	}
</script>

{#if isOpen}
	<div
		class="modal-backdrop"
		role="button"
		aria-roledescription="closes the modal"
		tabindex="-1"
		class:dark-backdrop="{darkBackdrop}"
		style="{$$props['style']}"
		on:keypress
		on:click="{backdropClick}"
	>
		<slot />
	</div>
{/if}
