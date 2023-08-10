<div class="{$$props['class'] ?? ''}" style="{$$props['style'] ?? ''}">
	<slot />
</div>

<style>
	div {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		padding: 5px;
	}
</style>
