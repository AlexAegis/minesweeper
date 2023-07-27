<script lang="ts">
	import { WindsGlobal } from '@alexaegis/winds';
	import Desktop from '../desktop/desktop.svelte';
	import { activeSchemeKind$ } from '../desktop/store';
</script>

<svelte:body
	class="w98 w2k"
	class:w2k-scheme-standard="{$activeSchemeKind$ === 'w2k'}"
	class:w2k-scheme-classic="{$activeSchemeKind$ === 'w98'}"
/>

<Desktop>
	<slot />
</Desktop>
<WindsGlobal />
