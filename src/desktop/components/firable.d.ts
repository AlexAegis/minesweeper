declare namespace svelte.JSX {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface HTMLProps<T> {
		onfire?: (event: CustomEvent<PointerEvent>) => void;
		onalternativefire?: (event: CustomEvent<PointerEvent>) => void;
		oncancelfire?: (event: CustomEvent<PointerEvent>) => void;
		onstartfire?: (event: CustomEvent<PointerEvent>) => void;
		ondoublefire?: (event: CustomEvent<PointerEvent>) => void;
	}
}
