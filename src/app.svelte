<script lang="ts">
	import Input from './components/input.svelte';
	import Container from './components/container.svelte';
	import Counter from './components/counter.svelte';

	let name = 'world';

	function logName() {
		console.log(name);
	}
</script>

<h1 on:click={logName}>Hello {name}!</h1>
<Input label="Label:" />
<Container>asd</Container>
<Counter />
