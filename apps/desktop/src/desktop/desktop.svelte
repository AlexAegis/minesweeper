<script lang="ts">
	import DesktopShortcuts from './components/desktop-shortcuts.svelte';
	import DesktopWindows from './components/desktop-windows.svelte';
	import Taskbar from './components/taskbar.svelte';
	import './styles/desktop.scss';

	import TaskbarPrograms from './components/taskbar-programs.svelte';
</script>

<div class="desktop">
	<div class="workspace">
		<DesktopShortcuts />
		<slot />
		<DesktopWindows />
	</div>
	<Taskbar>
		<TaskbarPrograms />
	</Taskbar>
</div>
