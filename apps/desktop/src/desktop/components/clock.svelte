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

<span>{$time$}</span>

<style lang="scss">
	span {
		padding-top: 1px;
		line-height: 17px;
	}
</style>
