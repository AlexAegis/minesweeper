<script lang="ts">
	import { Button, ColorPicker, Select } from '@w2k/ui';
	import AppearancePreview from './appearance-preview.svelte';
	import {
		defaultDesktopColorScheme,
		desktopColorSchemeSelectOptions,
		type DesktopColorScheme,
	} from './color-scheme.interface';

	export let temporaryScheme: DesktopColorScheme = {
		...defaultDesktopColorScheme,
	};

	let item: keyof DesktopColorScheme | undefined = undefined;
</script>

<div>
	<AppearancePreview desktopColorScheme="{temporaryScheme}"></AppearancePreview>
	<div class="options">
		<select
			name="schemeSelector"
			id="schemeSelector"
			style="grid-row: 2; grid-column: 1;"
			disabled
		></select>
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
				if (item && temporaryScheme[item] && temporaryScheme[item].color1) {
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
				if (item && temporaryScheme[item] && temporaryScheme[item].color2) {
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
