<script lang="ts">
	import Input from './components/input.svelte';
	import Container from './components/container.svelte';
	import Counter from './components/counter.svelte';
	import Minesweeper from './minesweeper/minesweeper.svelte';

	let name = 'world';

	function logName() {
		console.log(name);
	}
</script>

<Minesweeper />
