<script>
	let count = 1;
	$: doubled = count * 2;
	let tr = 2;
	function increment() {
		console.log('Inceremented');
		count++;
		tr = doubled + 1;
	}
</script>

<button on:click={increment}>Increment</button>
{count} double {doubled} tr {tr}
