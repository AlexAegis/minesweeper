<script lang="ts">
	import Observer from 'svelte-rxjs-observer/src/observer.svelte';
	import { desktopActions, programIds$, windowState } from '../store';
	import Window from './window.svelte';
</script>

<div class="desktop">
	<div class="workspace">
		<slot />

		{#each $programIds$ as programId}
			<Observer observable={windowState(programId)} let:next>
				<Window
					windowState={next}
					on:maximize={() => desktopActions.maximize.next(programId)}
					on:minimize={() => desktopActions.minimize.next(programId)}
					on:restore={() => desktopActions.restore.next(programId)}
					on:close={() => desktopActions.close.next(programId)}
					on:move={(event) => desktopActions.move.next({ programId, to: event.detail })}
				/>
			</Observer>
		{/each}
	</div>
</div>
<div class="taskbar window">
	<slot name="taskbar" />
</div>

<style lang="scss">
	.desktop {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		height: calc(100% - 32px);

		.workspace {
			height: 100%;
			width: 100%;
		}
	}

	.taskbar {
		--taskbar-height: 26px;
		height: var(--taskbar-height);

		position: fixed;

		bottom: 0px;
		width: calc(100% - 6px);
	}
</style>
