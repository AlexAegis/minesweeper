<script lang="ts">
	import { browser } from '$app/environment';
	import { BehaviorSubject, combineLatest, interval, map, startWith } from 'rxjs';
	import { onMount } from 'svelte';

	const language$ = new BehaviorSubject<string>('en');

	const time$ = combineLatest([
		language$,
		interval(1000).pipe(
			startWith(undefined),
			map(() => new Date()),
		),
	]).pipe(
		map(([language, date]) =>
			date.toLocaleTimeString(language, {
				hour: '2-digit',
				minute: '2-digit',
			}),
		),
	);

	onMount(() => {
		if (browser) {
			language$.next(navigator.language);
		}
	});
</script>

<span class="clock">{$time$}</span>

<style lang="scss">
	// The clocks last pixel is 16 pixel away from the edge of its panel,
	// the font has an extra empty pixel at the end, -3 px because of the panels padding (was measured by disabling the clock and checking where the last icon stops)
	.clock {
		font-variant-numeric: tabular-nums; // Not supported with tahoma-8px, but would be nice
		font-size: 16px;
		width: 48px;
		margin: 5px 8px 5px 9px;
		line-height: 8px;
		padding-top: 1.5px;
		padding-bottom: 0.5px;
	}
</style>
