<script lang="ts">
	export let title: string;
	export let icon: string = '';
	export let selected: boolean = false;
</script>

<div
	class="desktop-icon"
	class:selected
	on:click|preventDefault|stopPropagation={() => (selected = !selected)}
	on:dblclick
>
	<div class="icon" />
	<span class="title">{title}</span>
</div>

<style lang="scss">
	.desktop-icon {
		display: flex;
		position: fixed;

		flex-direction: column;
		align-items: center;

		margin: 16px;

		.icon {
			width: 32px;
			height: 32px;
			background-color: gray;
		}

		&.selected {
			background-color: blue;
		}

		.title {
			user-select: none;
		}
	}
</style>
