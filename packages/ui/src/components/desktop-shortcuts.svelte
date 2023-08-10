<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import { snapShortcutPosition, type DesktopSlice } from '../store';
	import Shortcut from './shortcut.svelte';

	export let desktopSlice: DesktopSlice;

	$: shortcutKeys$ = desktopSlice.dicedShortcuts.keys$;
</script>

{#each $shortcutKeys$ as shortcutKey}
	{@const shortcutSlice = desktopSlice.dicedShortcuts.get(shortcutKey)}
	<Observer observable="{shortcutSlice}" let:next>
		<Shortcut
			{desktopSlice}
			shortcutState="{next}"
			on:drop="{(event) => {
				shortcutSlice.internals.position$.set(snapShortcutPosition(event.detail));
			}}"
			on:dblclick="{(event) => {
				event.target;
				desktopSlice.desktop$.internals.actions.spawnProgram.next(next.program);
			}}"
		/>
	</Observer>
{/each}
