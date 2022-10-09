<script lang="ts">
	export let value: number | string;

	const topSegment = '02356789';

	$: last = typeof value === 'number' ? value % 10 : value[value.length - 1];
</script>

<div>
	<span
		style="grid-column: 2; grid-row: 1;"
		class:on={last === 0 || last === 2 || last === 3 || last >= 5}
		class="horizontal top"
	/>
	<span
		style="grid-column: 1; grid-row: 2;"
		class:on={last === 0 || (last >= 4 && last <= 6) || last >= 8 || last === 9}
		class="vertical left"
	/>
	<span
		style="grid-column: 3; grid-row: 2;"
		class:on={last <= 4 || last >= 7}
		class="vertical right"
	/>
	<span
		style="grid-column: 2; grid-row: 3;"
		class:on={last === '-' || (last >= 2 && last <= 6) || last >= 8}
		class="horizontal center"
	/>
	<span
		style="grid-column: 1; grid-row: 4;"
		class:on={last === 0 || last === 2 || last === 6 || last === 8}
		class="vertical left"
	/>
	<span
		style="grid-column: 3; grid-row: 4;"
		class:on={last <= 1 || last >= 3}
		class="vertical right"
	/>
	<span
		style="grid-column: 2; grid-row: 5;"
		class:on={last !== '-' && last !== 1 && last !== 4 && last !== 7}
		class="horizontal bottom"
	/>
</div>

<style lang="scss">
	div {
		width: var(--seven-segment-display-digit-only-width);
		height: var(--seven-segment-display-digit-only-height);

		background-color: black;
		display: grid;

		grid-template-columns:
			var(--seven-segment-display-gap)
			var(--seven-segment-display-horizontal-bar-width)
			var(--seven-segment-display-gap);
		grid-template-rows:
			var(--seven-segment-display-gap)
			var(--seven-segment-display-vertical-bar-height)
			var(--seven-segment-display-gap)
			var(--seven-segment-display-vertical-bar-height)
			var(--seven-segment-display-gap);

		padding: var(--seven-segment-display-gap);

		--low-angle: 31%; // 25%
		--high-angle: calc(100% - var(--low-angle));

		--low-angle-center: 24%; // 25%
		--high-angle-center: calc(100% - var(--low-angle-center));

		span {
			&:not(.on) {
				--off-fg: rgba(255, 0, 0, 0.35);
				--off-bg: rgba(255, 0, 0, 0.1);

				background: repeating-conic-gradient(var(--off-fg) 0 90deg, var(--off-bg) 0 180deg)
					0 0/25% 25%;
				background-size: 2px 2px;
			}

			&.on {
				background-color: red;
			}

			&.horizontal {
				justify-self: center;

				&:not(.center) {
					width: calc(var(--seven-segment-display-horizontal-bar-width) + 1px);
					height: var(--seven-segment-display-horizontal-bar-height);
				}

				&.center {
					width: calc(var(--seven-segment-display-horizontal-center-bar-width) + 3px);
					// height: var(--seven-segment-display-horizontal-bar-height);
					height: calc(var(--seven-segment-display-horizontal-center-bar-height) + 0px);
					clip-path: polygon(
						var(--low-angle-center) 0,
						var(--high-angle-center) 0,
						93% 50%,
						var(--high-angle-center) 100%,
						var(--low-angle-center) 100%,
						7% 50%
					);

					align-self: center;
				}

				&.top {
					clip-path: polygon(0 0, 100% 0, var(--high-angle) 100%, var(--low-angle) 100%);
					align-self: start;
				}

				&.bottom {
					clip-path: polygon(var(--low-angle) 0, var(--high-angle) 0, 100% 100%, 0% 100%);
					align-self: end;
				}
			}

			&.vertical {
				align-self: center;

				width: var(--seven-segment-display-vertical-bar-width);
				height: calc(var(--seven-segment-display-vertical-bar-height) + 0px);

				&.left {
					clip-path: polygon(0 0, 100% var(--low-angle), 100% var(--high-angle), 0% 100%);
					justify-self: start;
				}

				&.right {
					clip-path: polygon(0 var(--low-angle), 100% 0, 100% 100%, 0 var(--high-angle));
					justify-self: end;
				}
			}
		}
	}
</style>
