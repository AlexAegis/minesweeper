<script type="ts">
	import type { Observable, Subscription } from 'rxjs';
	import { onDestroy } from 'svelte';

	type T = $$Generic;

	interface $$Slots {
		default: {
			next: T;
		};
		error: {
			last: T | undefined;
			error: unknown;
		};
		pending: {};
		completed: {
			last: T | undefined;
		};
	}

	export let observable: Observable<T>;

	let completed = false;
	let pending = true;
	let next: T;
	let error: unknown | undefined = undefined;

	let subscription: Subscription | undefined;

	$: {
		completed = false;
		pending = true;
		error = undefined;
		next = undefined as T;
		subscription?.unsubscribe();
		subscription = observable?.subscribe({
			next: (n) => {
				next = n;
				pending = false;
			},
			error: (e) => (error = e),
			complete: () => (completed = true),
		});
	}

	onDestroy(() => subscription?.unsubscribe());
</script>

{#if completed}
	<slot name="completed" last={next} />
{:else if error}
	<slot name="error" {error} last={next} />
{:else if pending}
	<slot name="pending" />
{:else}
	<slot {next} />
{/if}
