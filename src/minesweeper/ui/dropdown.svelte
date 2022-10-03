<script lang="ts">
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';

	export let open = false;
	export let title: string;
</script>

<Button customLook={ButtonLook.MENU_ITEM}>
	{title}
</Button>
{#if open}
	<slot />
{/if}
