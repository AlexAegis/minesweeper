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
			--unit-gap: 1px;
			--inner-gap: calc(var(--unit-gap) * 3);

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
					width: var(--seven-segment-display-digit-only-width);
					height: var(--seven-segment-display-horizontal-bar-height);
				}

				&.center {
					width: calc(var(--seven-segment-display-horizontal-center-bar-width) + 2px);
					// height: var(--seven-segment-display-horizontal-bar-height);
					height: calc(var(--seven-segment-display-horizontal-center-bar-height) + 0px);

					clip-path: polygon(
						var(--unit-gap) 0%,
						calc(100% - var(--unit-gap)) 0%,
						calc(100%) var(--unit-gap),
						calc(100%) calc(100% - var(--unit-gap)),
						calc(100% - var(--unit-gap)) 100%,
						calc(var(--unit-gap)) 100%,
						0 calc(100% - var(--unit-gap)),
						0 var(--unit-gap)
					);

					align-self: center;
				}

				&.top,
				&.bottom {
					clip-path: polygon(
						var(--unit-gap) 0,
						var(--unit-gap) var(--unit-gap),
						var(--inner-gap) 100%,
						calc(100% - var(--inner-gap)) 100%,
						calc(100% - var(--unit-gap)) var(--unit-gap),
						calc(100% - var(--unit-gap)) 0
					);
				}

				&.top {
					align-self: start;
				}

				&.bottom {
					align-self: end;
					transform: rotate(180deg);
				}
			}

			&.vertical {
				align-self: center;

				width: var(--seven-segment-display-vertical-bar-width);
				height: calc(var(--seven-segment-display-vertical-bar-height) + 2px);

				&.left,
				&.right {
					justify-self: start;
					clip-path: polygon(
						0% var(--unit-gap),
						25% var(--unit-gap),
						92% var(--inner-gap),
						92% calc(100% - var(--inner-gap)),
						var(--unit-gap) calc(100% - var(--unit-gap)),
						0% calc(100% - var(--unit-gap))
					);
				}

				&.left {
					justify-self: start;
				}

				&.right {
					justify-self: end;
					transform: rotate(180deg);
				}
			}
		}
	}
</style>
