<script lang="ts">
	import {
		Button,
		ColorPicker,
		Select,
		w2kStandardColorScheme,
		type DesktopColorScheme,
		type DesktopSlice,
	} from '@w2k/ui';
	import { map } from 'rxjs';
	import { createEventDispatcher } from 'svelte';
	import AppearancePreview from './appearance-preview.svelte';
	import {
		defaultDesktopColorScheme,
		desktopColorSchemeSelectOptions,
	} from './color-scheme.interface';
	export let desktopSlice!: DesktopSlice;
	$: allSchemeNames$ = desktopSlice.dicedSchemes.items$.pipe(
		map((items) => {
			const sortedItems = items.sort((a, b) => a.displayName.localeCompare(b.displayName));
			const sortedEntries: [string, string][] = sortedItems.map((data) => [
				data.key,
				data.displayName,
			]);
			sortedEntries.push(['custom-scheme', '']);
			return Object.fromEntries(sortedEntries);
		}),
	);

	export let temporaryScheme: DesktopColorScheme = {
		...defaultDesktopColorScheme,
	};

	const dispatcher = createEventDispatcher<{ change: DesktopColorScheme }>();

	$: {
		dispatcher('change', temporaryScheme);
	}

	let item: keyof DesktopColorScheme | undefined = undefined;
	let scheme: string | undefined = undefined;

	$: {
		temporaryScheme = scheme
			? desktopSlice.schemes$.value[scheme]?.data ?? w2kStandardColorScheme
			: w2kStandardColorScheme;
		console.log('temporaryScheme', temporaryScheme);
	}
</script>

{JSON.stringify($allSchemeNames$)}
<div>
	<AppearancePreview desktopColorScheme="{temporaryScheme}"></AppearancePreview>
	<div class="options">
		<Select
			name="schemeSelector"
			options="{$allSchemeNames$}"
			style="grid-row: 2; grid-column: 1;"
			bind:value="{scheme}"
		></Select>
		<label for="schemeSelector" style="grid-row: 1; grid-column: 1;">Scheme:</label>
		<div class="scheme-operations">
			<Button disabled>Save as...</Button>
			<Button disabled>Delete</Button>
		</div>

		<Select
			name="schemeItem"
			options="{desktopColorSchemeSelectOptions}"
			style="grid-row: 4; grid-column: 1;"
			bind:value="{item}"
		></Select>
		<label for="schemeItem" style="grid-row: 3; grid-column: 1;">Item:</label>

		<ColorPicker style="grid-row: 4; grid-column: 2;" disabled></ColorPicker>
		<label for="schemeItemSize" style="grid-row: 3; grid-column: 2;">Size:</label>

		<ColorPicker
			style="grid-row: 4; grid-column: 3;"
			disabled="{item === undefined || temporaryScheme[item]?.color1 === undefined}"
			color="{item && temporaryScheme[item]?.color1}"
			on:change="{(event) => {
				if (item && temporaryScheme[item]?.color1) {
					temporaryScheme[item].color1 = event.detail;
				}
			}}"
		></ColorPicker>
		<label for="schemeItemColor1" style="grid-row: 3; grid-column: 3;">Color 1:</label>

		<ColorPicker
			style="grid-row: 4; grid-column: 4;"
			disabled="{item === undefined || temporaryScheme[item]?.color2 === undefined}"
			color="{item && temporaryScheme[item]?.color2}"
			on:change="{(event) => {
				if (item && temporaryScheme[item]?.color2) {
					temporaryScheme[item].color2 = event.detail;
				}
			}}"
		></ColorPicker>
		<label for="schemeItemColor2" style="grid-row: 3; grid-column: 4;">Color 2:</label>

		<select name="schemeFont" id="schemeFont" style="grid-row: 6; grid-column: 1;" disabled
		></select>
		<label for="schemeFont" style="grid-row: 5; grid-column: 1;">Font:</label>

		<ColorPicker style="grid-row: 6; grid-column: 2;" disabled></ColorPicker>
		<label for="schemeFontSize" style="grid-row: 5; grid-column: 2;">Size:</label>

		<ColorPicker style="grid-row: 6; grid-column: 3;" disabled></ColorPicker>
		<label for="schemeFontColor1" style="grid-row: 5; grid-column: 3;">Color 1:</label>

		<ColorPicker style="grid-row: 6; grid-column: 4;" disabled></ColorPicker>
		<label for="schemeFontColor2" style="grid-row: 5; grid-column: 4;">Color 2:</label>
	</div>
</div>

<style lang="scss">
	.options {
		width: 100%;
		display: grid;
		gap: 8px;
		margin-top: 8px;
		grid-template-columns: 1fr auto 41px 41px;

		.scheme-operations {
			grid-row: 2;
			grid-column: 2/ -1;
			display: flex;
			gap: inherit;
		}
	}

	select {
		width: 100%;
	}
</style>
