<script lang="ts">
	import { interval, map, startWith } from 'rxjs';

	const time$ = interval(1000).pipe(
		startWith(undefined),
		map(() => new Date()),
		map((date) =>
			date.toLocaleTimeString([...navigator.languages].reverse(), {
				hour: '2-digit',
				minute: '2-digit',
			})
		)
	);
</script>

<span>{$time$}</span>

<style lang="scss">
	span {
		padding-top: 1px;
		line-height: 17px;
	}
</style>
