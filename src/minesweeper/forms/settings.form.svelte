<script lang="ts">
	export let width: number;
	export let height: number;
	export let mineCount: number;
</script>

<form action="">
	<label for="width">Width:</label>
	<input name="width" type="number" bind:value={width} />
	<label for="height">Height:</label>
	<input name="height" type="number" bind:value={height} />
	<label for="mineCount">Mine count:</label>
	<input name="mineCount" type="number" bind:value={mineCount} />
</form>
