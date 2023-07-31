<script lang="ts">
	import DesktopShortcuts from './components/desktop-shortcuts.svelte';
	import DesktopWindows from './components/desktop-windows.svelte';
	import TaskbarPrograms from './components/taskbar-programs.svelte';
	import Taskbar from './components/taskbar.svelte';
	import './styles/desktop.scss';
</script>

<div id="desktop" class="desktop">
	<div id="workspace" class="workspace">
		<DesktopShortcuts />
		<slot />
	</div>
	<div id="windows" class="windows">
		<DesktopWindows />
	</div>
	<Taskbar>
		<TaskbarPrograms />
	</Taskbar>
</div>
