<script lang="ts">
	import { documentMouseUp$ } from './store';

	let mousedown = false;

	$: if ($documentMouseUp$) mousedown = false;
</script>

<button
	class="panel {$$props.class}"
	aria-label={$$props['aria-label']}
	style={$$props.style}
	class:inset={mousedown}
	on:mousedown={() => (mousedown = true)}
	on:click>
	<slot />
</button>
