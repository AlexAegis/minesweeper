/*
export const winHistory$: Observable<WinData[]> = isWon$.pipe(
	filter(identity),
	withLatestFrom(elapsedTime$, width$, height$, mineCount$),
	map(([, time, width, height, mineCount], id) => ({ time, width, height, mineCount, id })),
	scan((a, n) => {
		a.push(n);
		a.sort((a, b) => a.time - b.time);
		return a;
	}, [] as WinData[]),
	startWith([] as WinData[]),
	shareReplay({ refCount: true, bufferSize: 1 })
);
*/
export {};
