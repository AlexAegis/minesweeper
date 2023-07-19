<script lang="ts">
	import { filter, tap } from 'rxjs';
	import { onDestroy } from 'svelte';
	import { documentPointerup$ } from '../../root.store';
	import { ButtonLook } from './button-look.enum';
	import Button from './button.svelte';

	export let title: string;
	export let hotkeyLetter: string | undefined = undefined;

	export let active: string | undefined;

	let button: HTMLElement;

	const clickListener = documentPointerup$
		.pipe(
			filter((event) => {
				const elementsUnderPointer = document.elementsFromPoint(event.pageX, event.pageY);
				return ![...(button.parentElement?.children ?? [])].some((child) =>
					elementsUnderPointer.includes(child),
				);
			}),
			tap(() => (active = undefined)),
		)
		.subscribe();

	function itemClick(event: MouseEvent) {
		if (
			(event.target as Element).nodeName !== 'HR' &&
			(event.target as Element).nodeName !== 'DIV'
		) {
			active = undefined;
		}
	}

	function pointerenter(event: PointerEvent): void {
		if (event.pointerType === 'mouse' && active !== undefined && active !== title) {
			active = title;
		}
	}

	function click(_event: MouseEvent): void {
		active = active === title ? undefined : title;
	}

	onDestroy(() => {
		clickListener.unsubscribe();
	});
</script>

<Button
	bind:button
	look="{ButtonLook.TITLE_BAR_MENU_ITEM}"
	active="{active === title}"
	disable-self-inset="{active === undefined}"
	on:pointerenter="{pointerenter}"
	on:click="{click}"
	{hotkeyLetter}
>
	{title}
	{#if active === title}
		<div
			role="presentation"
			class="dropdown window"
			on:click|preventDefault|stopPropagation="{itemClick}"
			on:keypress
		>
			<slot />
		</div>
	{/if}
</Button>

<style>
	.dropdown {
		display: flex;
		position: absolute;
		top: 43px;
		min-width: 150px;
		flex-direction: column;
		margin-left: -12px;
		z-index: 100;
		padding: 2px;
	}
</style>
