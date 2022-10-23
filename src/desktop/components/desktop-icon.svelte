<script lang="ts">
	export let title: string;
	export let icon: string | undefined = undefined;
	export let selected: boolean = false;
	export let shortcut: boolean = true;
</script>

<div
	class="desktop-icon"
	class:selected
	on:keypress
	on:click|preventDefault|stopPropagation={() => (selected = !selected)}
	on:dblclick
>
	<div class="icon{icon ? ` ${icon}` : ''}" />
	<span class="title">{title}</span>
	{#if shortcut}
		<div class="shortcut" />
	{/if}
</div>

<style lang="scss">
	.desktop-icon {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		position: fixed;

		row-gap: 4px;

		align-items: center;
		justify-items: center;

		margin: 16px;

		user-select: none;

		.icon {
			width: 28px;
			height: 28px;
			grid-row: 1;
			grid-column: 2;

			&.minesweeper {
				background-image: var(--asset-minesweeper);
				background-repeat: no-repeat;
				image-rendering: pixelated;
			}
		}

		.shortcut {
			width: 11px;
			height: 11px;
			background-image: var(--asset-shortcut);
			background-repeat: no-repeat;
			image-rendering: pixelated;
			z-index: 1;
			grid-row: 1;
			grid-column: 2;
			justify-self: start;
			align-self: end;
		}

		&.selected {
			.icon {
				// box-shadow: inset 0 0 0 2000px rgba(var(--selection-rgb), 0.5);
				filter: contrast(0.5) brightness(1.5) sepia(1) hue-rotate(180deg) contrast(0.8)
					saturate(4);
			}

			.title {
				background-color: rgb(var(--selection-rgb));
				color: white;
			}
		}

		.title {
			padding: 0 2px 0 2px;
			user-select: none;
			font-size: 18px;
			line-height: 18px;
			grid-row: 2;
			grid-column: 1 / -1;
		}
	}
</style>
