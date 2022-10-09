<script lang="ts">
	import { desktopActions, DesktopProgram } from './minesweeper/store/desktop.store';
	import DesktopIcon from './minesweeper/ui/desktop-icon.svelte';
	import Desktop from './minesweeper/ui/desktop.svelte';
</script>

<Desktop>
	<DesktopIcon
		title="Minesweeper"
		on:dblclick={() => desktopActions.spawn.next(DesktopProgram.MINESWEEPER)}
	/>
</Desktop>
