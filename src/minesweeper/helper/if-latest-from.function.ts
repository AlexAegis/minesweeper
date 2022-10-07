import {
	filter,
	map,
	withLatestFrom,
	type Observable,
	type ObservableInput,
	type OperatorFunction,
} from 'rxjs';

export function ifLatestFrom<T, O>(
	input: ObservableInput<O>,
	condition: (inputResult: O) => boolean
): OperatorFunction<T, T> {
	return (source: Observable<T>) => {
		return source.pipe(
			withLatestFrom(input),
			filter(([, inputResult]) => condition(inputResult)),
			map(([a]) => a)
		);
	};
}
