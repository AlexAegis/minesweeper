<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import { desktop$, dicedShortcuts, snapShortcutPosition } from '../store';
	import Shortcut from './shortcut.svelte';

	$: shortcutKeys$ = dicedShortcuts.keys$;
</script>

{#each $shortcutKeys$ as shortcutKey}
	{@const shortcutSlice = dicedShortcuts.get(shortcutKey)}
	<Observer observable="{shortcutSlice}" let:next>
		<Shortcut
			shortcutState="{next}"
			on:drop="{(event) => {
				shortcutSlice.internals.position$.set(snapShortcutPosition(event.detail));
			}}"
			on:dblclick="{(event) => {
				event.target;
				desktop$.internals.actions.spawnProgram.next(next.program);
			}}"
		/>
	</Observer>
{/each}
