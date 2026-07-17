<script lang="ts">
	import {
		Button,
		ColorPicker,
		Select,
		cloneDesktopColorScheme,
		w2kStandardColorScheme,
		type ColorRgb,
		type DesktopColorScheme,
		type DesktopSlice,
	} from '@w2k/ui';
	import { map } from 'rxjs';
	import AppearancePreview from './appearance-preview.svelte';
	import {
		defaultDesktopColorScheme,
		desktopColorSchemeSelectOptions,
	} from './color-scheme.interface';

	interface Props {
		desktopSlice: DesktopSlice;
		temporaryScheme?: DesktopColorScheme;
		onChange?: ((scheme: DesktopColorScheme) => void) | undefined;
	}

	let {
		desktopSlice,
		temporaryScheme = $bindable({
			...defaultDesktopColorScheme,
		}),
		onChange = undefined,
	}: Props = $props();

	// The unsaved scheme forked off a built-in by editing it. Named after its
	// origin, like 'Standard Scheme *'. When the dialog opens while a custom
	// scheme is already active, its origin is unknown. Until a fork exists (the
	// name is empty), the entry is left out of the selector entirely.
	// svelte-ignore state_referenced_locally
	let customSchemeName = $state(
		desktopSlice.activeSchemeKind$.value === 'custom-scheme' ? 'Custom Scheme' : '',
	);

	let item: keyof DesktopColorScheme | undefined = $state(undefined);
	// Start on the scheme that is currently active; edits fork into the blank
	// 'custom-scheme' entry so the built-in schemes are never modified.
	// svelte-ignore state_referenced_locally
	let scheme: string | undefined = $state(desktopSlice.activeSchemeKind$.value);

	function selectScheme(): void {
		// The custom entry holds the current (already cloned) edits, there is
		// nothing to load for it.
		if (scheme === 'custom-scheme') {
			return;
		}
		// Clone so editing never writes back into the stored schemes (the built-in
		// ones are immutable) or the shared scheme constants.
		temporaryScheme = cloneDesktopColorScheme(
			(scheme ? desktopSlice.schemes$.value[scheme]?.data : undefined) ??
				w2kStandardColorScheme,
		);
	}

	function editColor(colorKey: 'color1' | 'color2', color: ColorRgb): void {
		if (item && temporaryScheme[item]?.[colorKey]) {
			temporaryScheme[item][colorKey] = color;
			// Editing any scheme turns the selection into the unsaved custom scheme,
			// named after the scheme it forked off, leaving the original untouched.
			if (scheme !== 'custom-scheme') {
				customSchemeName = `${(scheme && $allSchemeNames$[scheme]) || 'Custom Scheme'} *`;
				scheme = 'custom-scheme';
			}
		}
	}
	let allSchemeNames$ = $derived(
		desktopSlice.dicedSchemes.items$.pipe(
			map((items) => {
				const sortedItems = items.sort((a, b) =>
					a.displayName.localeCompare(b.displayName),
				);
				const sortedEntries: [string, string][] = sortedItems.map((data) => [
					data.key,
					data.displayName,
				]);
				return Object.fromEntries(sortedEntries);
			}),
		),
	);
	let schemeOptions = $derived(
		customSchemeName
			? { ...$allSchemeNames$, 'custom-scheme': customSchemeName }
			: $allSchemeNames$,
	);
	$effect(() => {
		onChange?.(temporaryScheme);
	});
</script>

<div>
	<AppearancePreview desktopColorScheme={temporaryScheme}></AppearancePreview>
	<div class="options">
		<Select
			name="schemeSelector"
			options={schemeOptions}
			style="grid-row: 2; grid-column: 1;"
			bind:value={scheme}
			onchange={selectScheme}
		></Select>
		<label for="schemeSelector" style="grid-row: 1; grid-column: 1;">Scheme:</label>
		<div class="scheme-operations">
			<Button disabled>Save as...</Button>
			<Button disabled>Delete</Button>
		</div>

		<Select
			name="schemeItem"
			options={desktopColorSchemeSelectOptions}
			style="grid-row: 4; grid-column: 1;"
			bind:value={item}
		></Select>
		<label for="schemeItem" style="grid-row: 3; grid-column: 1;">Item:</label>

		<ColorPicker style="grid-row: 4; grid-column: 2;" disabled></ColorPicker>
		<label for="schemeItemSize" style="grid-row: 3; grid-column: 2;">Size:</label>

		<ColorPicker
			style="grid-row: 4; grid-column: 3;"
			disabled={item === undefined || temporaryScheme[item]?.color1 === undefined}
			color={item && temporaryScheme[item]?.color1}
			onChange={(color) => {
				editColor('color1', color);
			}}
		></ColorPicker>
		<label for="schemeItemColor1" style="grid-row: 3; grid-column: 3;">Color 1:</label>

		<ColorPicker
			style="grid-row: 4; grid-column: 4;"
			disabled={item === undefined || temporaryScheme[item]?.color2 === undefined}
			color={item && temporaryScheme[item]?.color2}
			onChange={(color) => {
				editColor('color2', color);
			}}
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
