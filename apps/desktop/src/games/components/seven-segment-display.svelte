<script lang="ts">
	export let value: number | string;

	const topSegment = '02356789';
	const topLeftSegment = '045689';
	const topRightSegment = '01234789';
	const centerSegment = '-2345689';
	const bottomLeftSegment = '0268';
	const bottomRightSegment = '013456789';
	const bottomSegment = '0235689';

	$: last = typeof value === 'number' ? value % 10 : value.at(-1) ?? '0';
</script>

<div>
	<span
		style="grid-column: 2; grid-row: 1;"
		class:on="{topSegment.includes(last.toString())}"
		class="horizontal top"
	></span>
	<span
		style="grid-column: 1; grid-row: 2;"
		class:on="{topLeftSegment.includes(last.toString())}"
		class="vertical left"
	></span>
	<span
		style="grid-column: 3; grid-row: 2;"
		class:on="{topRightSegment.includes(last.toString())}"
		class="vertical right"
	></span>
	<span
		style="grid-column: 2; grid-row: 3;"
		class:on="{centerSegment.includes(last.toString())}"
		class="horizontal center"
	></span>
	<span
		style="grid-column: 1; grid-row: 4;"
		class:on="{bottomLeftSegment.includes(last.toString())}"
		class="vertical left"
	></span>
	<span
		style="grid-column: 3; grid-row: 4;"
		class:on="{bottomRightSegment.includes(last.toString())}"
		class="vertical right"
	></span>
	<span
		style="grid-column: 2; grid-row: 5;"
		class:on="{bottomSegment.includes(last.toString())}"
		class="horizontal bottom"
	></span>
</div>

<style lang="scss">
	div {
		--unit-gap: 1px;
		--inner-gap: calc(var(--unit-gap) * 3);

		width: var(--seven-segment-display-digit-only-width);

		// Some adjustment is needed
		height: calc(var(--seven-segment-display-digit-only-height) - 1px);
		background-color: black;
		display: grid;
		grid-template-columns:
			var(--unit-gap)
			var(--seven-segment-display-horizontal-bar-width)
			var(--unit-gap);
		grid-template-rows:
			var(--unit-gap)
			var(--seven-segment-display-vertical-bar-height)
			0 // would be 1px with original measurements
			var(--seven-segment-display-vertical-bar-height)
			var(--unit-gap);
		padding: var(--unit-gap);

		span {
			&:not(.on) {
				--off-fg: rgb(255 0 0 / 35%);
				--off-bg: rgb(255 0 0 / 10%);

				background: repeating-conic-gradient(var(--off-fg) 0 90deg, var(--off-bg) 0 180deg)
					0 0 / 25% 25%;
				background-size: 2px 2px;
			}

			&.on {
				background-color: red;
			}

			&.horizontal {
				justify-self: center;

				&:not(.center) {
					width: calc(var(--seven-segment-display-digit-only-width) - 1px);
					height: var(--seven-segment-display-horizontal-bar-height);
				}

				&.center {
					width: calc(var(--seven-segment-display-horizontal-center-bar-width) + 0px);

					// height: var(--seven-segment-display-horizontal-bar-height);
					height: calc(var(--seven-segment-display-horizontal-center-bar-height));
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
				height: calc(var(--seven-segment-display-vertical-bar-height) + 1px);

				&.left,
				&.right {
					justify-self: start;
					clip-path: polygon(
						0% var(--unit-gap),
						var(--unit-gap) var(--unit-gap),
						100% var(--inner-gap),
						100% calc(100% - var(--inner-gap)),
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
