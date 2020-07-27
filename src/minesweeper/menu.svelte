<script lang="ts">
	import Button from './button.svelte';
</script>

<style>
	div {
		display: flex;
		height: max-content;
	}
</style>

<div>
	<Button>game</Button>
	<Button
		on:click={() => window.open('https://www.github.com/alexaegis/svelte-sandbox', '_blank')}>
		github
	</Button>
</div>
