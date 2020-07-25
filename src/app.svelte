<script lang="ts">
	import Input from './components/input.svelte';
	import Container from './components/container.svelte';
	import Counter from './components/counter.svelte';
	import Minesweeper from './minesweeper/minesweeper.svelte';

	export let name = 'world';

	export function logName() {
		console.log(name);
	}
</script>

<Minesweeper />
