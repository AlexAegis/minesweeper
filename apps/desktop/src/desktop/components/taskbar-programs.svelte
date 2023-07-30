<script lang="ts">
	import { Observer } from 'svelte-rxjs-observer';
	import { desktop$, dicedWindows } from '../store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';

	const windowKeys$ = dicedWindows.keys$;
</script>

{#each $windowKeys$ as windowKey}
	{@const windowSlice = dicedWindows.get(windowKey)}
	<Observer observable="{windowSlice}" let:next>
		<Button
			look="{ButtonLook.TASKBAR_ITEM}"
			active="{next.active}"
			icon="{next.titleBarIcon}"
			on:click="{() => {
				if (next.active) {
					windowSlice.internals.windowActions.minimize.next(true);
				} else {
					desktop$.internals.actions.activateProgram.next(next.processId);
				}
			}}">{next.title}</Button
		>
	</Observer>
{/each}
