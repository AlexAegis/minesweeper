import {
	Action,
	entitySliceReducerWithPrecompute,
	ifLatestFrom,
	Slice,
	type DicedSlice,
} from '@tinyslice/core';
import {
	combineLatest,
	distinctUntilChanged,
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	of,
	shareReplay,
	startWith,
	switchMap,
	take,
	takeUntil,
	timer,
	withLatestFrom,
} from 'rxjs';
import {
	Coordinate,
	getNextTileMark,
	isEmptyTileMark,
	isFlagTileMark,
	isQuestionTileMark,
	TileMark,
	type CoordinateKey,
	type CoordinateLike,
} from '../core';
import { isTheSamePreset, type GamePreset, type WinData } from '../core/game-preset.interface';
import {
	GameState,
	isGameLost,
	isGameOngoing,
	isGameReadyToStart,
	isGameWon,
} from '../core/game-state.enum';
import { shuffle } from '../helper';
import { debug$ } from './root.store';
import { MS_TAG, scope } from './scope';

export interface Game {
	presets: Record<string, GamePreset>;
	instance: GameInstance;
	history: WinData[];
	cheating: boolean;
}

export enum FieldState {
	SAFE,
	MINE,
}

export enum SmileyState {
	/**
	 * Normally
	 */
	SMILING = 'ongoing',
	/**
	 * While mousedown
	 */
	SURPRISED = 'click',
	/**
	 * If won
	 */
	COOL = 'won',
	/**
	 * If lost...
	 */
	DEAD = 'lost',
}

export type DicedTiles = DicedSlice<
	Record<CoordinateKey, TileState>,
	TileState,
	unknown,
	unknown,
	CoordinateKey
>;

export interface TileState {
	x: number;
	y: number;
	value: number;
	isMine: boolean;
	mark: TileMark;
	guessedWrong: boolean;
	revealed: boolean;
	/**
	 * Whether or not the tile should appear as pressed
	 */
	pressed: boolean;
	/**
	 * Tiles are disabled when the game is ended
	 */
	disabled: boolean;
}

export interface GameInstance {
	settings: GamePreset;
	elapsedTime: number;
	clickCount: number;
	gameState: GameState;
	cheated: boolean;
	tiles: Record<CoordinateKey, TileState>;
}

/**
 * Take all tiles, shuffle them, take the first n amount, those will be the mines
 */
const selectNRandomTiles = (
	tiles: CoordinateLike[],
	safeCoordinate: CoordinateLike,
	amount: number
): CoordinateLike[] => {
	const tilesCopy = [
		...tiles.filter((tile) => tile.x !== safeCoordinate.x || tile.y !== safeCoordinate.y),
	];
	shuffle(tilesCopy);
	return tilesCopy.splice(0, amount).map((tile) => ({ x: tile.x, y: tile.y } as CoordinateLike));
};

const isAWinState = (tiles: TileState[]): boolean =>
	tiles.every((tile) => (tile.isMine && !tile.revealed) || (!tile.isMine && tile.revealed));
const isALoseState = (tiles: TileState[]): boolean =>
	tiles.some((tile) => tile.isMine && tile.revealed);
const revealEndStateReducer = (
	tiles: Record<CoordinateKey, TileState>,
	revealedTileKey: CoordinateKey
): Record<CoordinateKey, TileState> =>
	Object.entries(tiles).reduce((acc, [tileKey, tile]) => {
		if (isFlagTileMark(tile.mark) && !tile.isMine) {
			acc[tileKey] = {
				...tile,
				disabled: true,
				revealed: true,
				guessedWrong: true,
			};
		} else if (!isFlagTileMark(tile.mark) && tile.isMine) {
			acc[tileKey] = {
				...tile,
				disabled: true,
				revealed: true,
				guessedWrong: tileKey === revealedTileKey,
			};
		} else {
			acc[tileKey] = { ...tile, disabled: true };
		}
		return acc;
	}, {} as Record<CoordinateKey, TileState>);

const initialTile: TileState = {
	x: 0,
	y: 0,
	pressed: false,
	revealed: false,
	value: 0,
	isMine: false,
	mark: TileMark.EMTPY,
	guessedWrong: false,
	disabled: false,
};

const generateGameInstance = (settings: GamePreset): GameInstance => {
	const gameInstanceInitialState: GameInstance = {
		settings,
		elapsedTime: 0,
		clickCount: 0,
		gameState: GameState.READY_TO_START,
		tiles: {},
		cheated: false,
	};

	for (let x = 0; x < settings.width; x++) {
		for (let y = 0; y < settings.height; y++) {
			gameInstanceInitialState.tiles[Coordinate.keyOf(x, y)] = {
				...initialTile,
				x,
				y,
			};
		}
	}

	return gameInstanceInitialState;
};

export const CLASSIC_GAME_PRESETS = {
	beginner: {
		width: 9,
		height: 9,
		mineCount: 10,
	},
	intermediate: {
		width: 16,
		height: 16,
		mineCount: 40,
	},
	expert: {
		width: 30,
		height: 16,
		mineCount: 99,
	},
};

const TIME_TICKRATE_MS = 1000;

export interface HighscoreEntry {
	title: string;
	description: string;
	timeStamp: string;
	time: number;
}

export interface MinesweeperGame {
	game$: Slice<unknown, Game>;
	dicedTiles: DicedTiles;
	elapsedSeconds$: Observable<number>;
	remainingMines$: Observable<number>;
	gameHeightArray$: Observable<number[]>;
	gameWidthArray$: Observable<number[]>;
	smileyState$: Observable<SmileyState>;
	gameSettings$: Observable<GamePreset>;
	isGameSettingsAPreset$: (preset: GamePreset) => Observable<boolean>;
	isGameSettingsNotAPreset$: Observable<boolean>;
	getGameTileState: (x: number, y: number) => Observable<TileState>;
	highscoreEntries$: Observable<HighscoreEntry[]>;
	presets$: Observable<Record<string, GamePreset>>;
	minesweeperActions: {
		resetGame: Action<GamePreset | void>;
		cheating: Action<boolean>;
		clickActions: {
			leftclickDown: Action<CoordinateLike>;
			leftclickUp: Action<CoordinateLike>;
			rightclickUp: Action<CoordinateLike>;
			cancelClick: Action<CoordinateLike>;
		};
	};
	cheating$: Observable<boolean>;
	[key: string]: unknown;
}

export const createMineSweeperGame = <ParentSlice, T>(
	parentSlice: Slice<ParentSlice, T>,
	key: string
): MinesweeperGame => {
	const game$ = parentSlice.addSlice(key, {
		instance: generateGameInstance(CLASSIC_GAME_PRESETS.beginner),
		history: [],
		presets: CLASSIC_GAME_PRESETS,
		cheating: false,
	} as Game);

	const TILE_TAG = '[tile]';
	const CLICK_TAG = '[click]';

	const cheating$ = game$.slice('cheating');

	const minesweeperActions = {
		cheating: cheating$.setAction,
		resetGame: game$.createAction<GamePreset | void>(`${MS_TAG} reset`),
		startGame: game$.createAction<{ safeCoordinate: CoordinateLike; mineCount: number }>(
			`${MS_TAG} start game`
		),
		setPreset: game$.createAction<{ name: string; preset: GamePreset }>(`${MS_TAG} set preset`),
		addGameToHistory: game$.createAction<WinData>(`${MS_TAG} add game to history`),
		incrementTimer: game$.createAction<number>(`${MS_TAG} increment timer ms`),
		tileActions: {
			revealTile: game$.createAction<CoordinateLike>(`${MS_TAG} ${TILE_TAG} reveal`),
			depressTile: game$.createAction<CoordinateLike>(`${MS_TAG} ${TILE_TAG} depress`),
			markTile: game$.createAction<CoordinateLike>(`${MS_TAG} ${TILE_TAG} mark`),
		},
		clickActions: {
			cancelClick: game$.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} cancel`),
			globalMouseUp: game$.createAction<void>(`${MS_TAG} ${CLICK_TAG} global up`),
			leftclickDown: game$.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} left down`),
			leftclickUp: game$.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} left up`),
			middleclickDown: game$.createAction<CoordinateLike>(
				`${MS_TAG} ${CLICK_TAG} middle down`
			),
			middleclickUp: game$.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} middle up`),
			rightclickDown: game$.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} right down`),
			rightclickUp: game$.createAction<CoordinateLike>(`${MS_TAG} ${CLICK_TAG} right up`),
		},
	};

	const presets$ = game$.slice('presets', {
		reducers: [
			minesweeperActions.setPreset.reduce((state, { name, preset }) => ({
				...state,
				[name]: preset,
			})),
			debug$.setAction.reduce((state, debug) => {
				if (debug) {
					return {
						...state,
						debug: {
							width: 2,
							height: 2,
							mineCount: 2,
						},
					};
				} else if ('debug' in state) {
					const nextState = { ...state };
					delete nextState.debug;
					return nextState;
				} else {
					return state;
				}
			}),
		],
	});

	const gameInstance$ = game$.slice('instance', {
		reducers: [
			minesweeperActions.resetGame.reduce((state, payload) => ({
				...generateGameInstance(payload ?? state.settings),
			})),
			minesweeperActions.startGame.reduce((state, { safeCoordinate, mineCount }) => {
				const mines = selectNRandomTiles(
					Object.values(state.tiles),
					safeCoordinate,
					mineCount
				);
				const tiles: Record<string, TileState> = { ...state.tiles };

				for (const mineCoordinate of mines) {
					const mineKey = Coordinate.keyOf(mineCoordinate);
					tiles[mineKey] = { ...tiles[mineKey], isMine: true };

					for (const mineNeighbour of getNeighbouringCoordinateKeys(
						tiles,
						mineCoordinate
					)) {
						const tile = tiles[mineNeighbour];
						if (tile) {
							if (!tile.isMine) {
								tiles[mineNeighbour] = { ...tile, value: tile.value + 1 };
							}
						}
					}
				}
				return { ...state, gameState: GameState.ONGOING, tiles };
			}),
			minesweeperActions.tileActions.revealTile.reduce((state, revealedTile) => {
				const revealedTileKey = Coordinate.keyOf(revealedTile);
				const tiles = Object.values(state.tiles);
				const didJustWin = isAWinState(tiles);
				const didJustLose = isALoseState(tiles);
				if (didJustWin || didJustLose) {
					return {
						...state,
						gameState: didJustWin ? GameState.WON : GameState.LOST,
						tiles: revealEndStateReducer(state.tiles, revealedTileKey),
					};
				}
				return state;
			}),
			minesweeperActions.tileActions.depressTile.reduce((state) => ({
				...state,
				clickCount: state.clickCount + 1,
			})),
		],
	});

	const cheated$ = gameInstance$.slice('cheated');
	const gameSettings$ = gameInstance$.slice('settings');

	const isGameSettingsAPreset$ = (preset: GamePreset) =>
		gameSettings$.pipe(map((settings) => isTheSamePreset(preset, settings)));

	const isGameSettingsNotAPreset$ = combineLatest([gameSettings$, presets$]).pipe(
		map(
			([settings, presets]) =>
				!Object.values(presets).some((preset) => isTheSamePreset(preset, settings))
		)
	);

	const gameWidthArray$ = gameSettings$.pipe(
		map((settings) => [...Array(settings.width).keys()])
	);
	const gameHeightArray$ = gameSettings$.pipe(
		map((settings) => [...Array(settings.height).keys()])
	);

	const winHistory$ = game$.slice('history', {
		reducers: [
			minesweeperActions.addGameToHistory.reduce((state, payload) => [...state, payload]),
		],
	});

	const highscoreEntries$: Observable<HighscoreEntry[]> = winHistory$.pipe(
		withLatestFrom(presets$),
		map(([winHistory, presets]) =>
			winHistory
				.map((winEntry) => {
					const presetName = Object.entries(presets).find(([, preset]) =>
						isTheSamePreset(preset, winEntry.preset)
					)?.[0];

					const seconds = winEntry.time / 1000;
					const minutes = Math.floor(seconds / 60);
					const remainingSeconds = seconds % 60;
					const timeStamp = `${minutes ? minutes + 'm ' : ''}${remainingSeconds}s`;
					return {
						title: presetName ?? 'Custom',
						description: `${winEntry.cheated ? 'Debug ' : ''}size: ${
							winEntry.preset.height
						}*${winEntry.preset.width}, mines: ${winEntry.preset.mineCount}`,
						timeStamp,
						time: winEntry.time,
					} as HighscoreEntry;
				})
				.sort((a, b) => a.time - b.time)
		)
	);

	const gameState$ = gameInstance$.slice('gameState');

	const isGameWon$ = gameState$.pipe(map(isGameWon));
	const gameWon$ = isGameWon$.pipe(
		distinctUntilChanged(),
		filter((won) => won)
	);

	const isGameLost$ = gameState$.pipe(map(isGameLost));
	const gameLost$ = isGameLost$.pipe(
		distinctUntilChanged(),
		filter((lost) => lost)
	);

	const isGameEnded$ = gameState$.pipe(
		map((gameState) => isGameLost(gameState) || isGameWon(gameState))
	);
	const gameEnded$ = isGameLost$.pipe(
		distinctUntilChanged(),
		filter((ended) => ended)
	);

	const isGameOngoing$ = gameState$.pipe(map(isGameOngoing));
	const gameStarted$ = isGameOngoing$.pipe(
		distinctUntilChanged(),
		filter((ongoing) => ongoing)
	);

	const elapsedTime$ = gameInstance$.slice('elapsedTime', {
		reducers: [minesweeperActions.incrementTimer.reduce((state, elapsed) => state + elapsed)],
	});

	const elapsedSeconds$ = elapsedTime$.pipe(map((elapsedTime) => Math.floor(elapsedTime / 1000)));

	const getNeighbouringCoordinates = (coordinate: CoordinateLike): CoordinateLike[] =>
		Object.values(Coordinate.directions).map((direction) => ({
			x: coordinate.x + direction.x,
			y: coordinate.y + direction.y,
		}));

	const getNeighbouringCoordinateKeys = (
		tiles: Record<CoordinateKey, TileState>,
		coordinate: CoordinateLike
	): CoordinateKey[] =>
		getNeighbouringCoordinates(coordinate)
			.map(Coordinate.keyOf)
			.filter((neighbourKey) => Object.hasOwn(tiles, neighbourKey));

	const getNeighbouringTiles = (
		tiles: Record<CoordinateKey, TileState>,
		coordinate: CoordinateLike
	): TileState[] =>
		getNeighbouringCoordinateKeys(tiles, coordinate).map((tileKey) => tiles[tileKey]);

	/**
	 * Collects all tiles that either have no neighbouring mines or a neighbour of such tile
	 */
	const spillOnSafeTiles = (
		tiles: Record<CoordinateKey, TileState>,
		key: CoordinateKey,
		checked: Set<CoordinateKey> = new Set()
	): CoordinateKey[] => {
		const tile = tiles[key];

		if (checked.has(key)) {
			return [];
		} else {
			checked.add(key);
		}
		if (!tile.isMine && tile.value === 0) {
			return [
				key,
				...getNeighbouringCoordinateKeys(tiles, tile).flatMap((neighbour) =>
					spillOnSafeTiles(tiles, neighbour, checked)
				),
			];
		} else if (!tile.isMine) {
			return [key];
		} else {
			return [];
		}
	};

	const tilesSlice$ = gameInstance$.slice('tiles', {
		reducers: [
			minesweeperActions.tileActions.depressTile.reduce(
				entitySliceReducerWithPrecompute(
					(state, payload) => ({
						neighbours: getNeighbouringCoordinateKeys(state, payload),
						sourceTile: state[Coordinate.keyOf(payload)],
					}),
					(key, tile, payload, { neighbours, sourceTile }) => {
						const isSameTile = Coordinate.keyOf(payload) === key;
						const isANeighbour = neighbours.includes(key);

						if (isSameTile && !tile.revealed) {
							return { ...tile, pressed: true };
						}

						if (isANeighbour && sourceTile.revealed && !tile.revealed) {
							return { ...tile, pressed: true };
						}
					}
				)
			),
			minesweeperActions.clickActions.cancelClick.reduce(
				entitySliceReducerWithPrecompute(
					(state, revealedTileCoord) => ({
						revealedTileCoordKey: Coordinate.keyOf(revealedTileCoord),
						pressedNeighbourkeys: getNeighbouringTiles(state, revealedTileCoord)
							.filter((neighbour) => neighbour.pressed)
							.map((coord) => Coordinate.keyOf(coord)),
					}),
					(key, tile, _payload, { revealedTileCoordKey, pressedNeighbourkeys }) => {
						if (
							(revealedTileCoordKey === key && tile.pressed) ||
							pressedNeighbourkeys.includes(key)
						) {
							return { ...tile, pressed: false };
						}
					}
				)
			),
			minesweeperActions.tileActions.revealTile.reduce(
				entitySliceReducerWithPrecompute(
					(state, revealedTileCoord) => {
						const revealedTileKey = Coordinate.keyOf(revealedTileCoord);
						const revealedTile = state[revealedTileKey];
						const neighbourKeys = getNeighbouringCoordinateKeys(
							state,
							revealedTileCoord
						);
						const neighbours = getNeighbouringTiles(state, revealedTileCoord);
						// const neighbourCount = neighbours.length;
						const neighbouringMines = neighbours.filter(
							(neighbour) => neighbour.isMine
						).length;
						const flaggedNeighbours = neighbours.filter((neighbour) =>
							isFlagTileMark(neighbour.mark)
						).length;
						const uncertainNeighbours = neighbours.filter((neighbour) =>
							isQuestionTileMark(neighbour.mark)
						).length;
						const canRevealNeighbours =
							neighbouringMines === flaggedNeighbours &&
							uncertainNeighbours === 0 &&
							isEmptyTileMark(revealedTile.mark);

						const checked = new Set<CoordinateKey>();
						const spill = spillOnSafeTiles(state, revealedTileKey, checked);
						if (canRevealNeighbours) {
							for (const neighbourKey of neighbourKeys) {
								spill.push(...spillOnSafeTiles(state, neighbourKey, checked));
							}
						}

						return {
							spill,
							canRevealNeighbours,
							neighbourKeys,
							revealedTileKey,
						};
					},
					(
						key,
						tile,
						_revealedTile,
						{ spill, canRevealNeighbours, revealedTileKey, neighbourKeys }
					) => {
						if (!tile.revealed && (revealedTileKey === key || spill.includes(key))) {
							if (isEmptyTileMark(tile.mark)) {
								return { ...tile, revealed: true, pressed: false };
							} else if (revealedTileKey === key) {
								return { ...tile, mark: TileMark.EMTPY, pressed: false };
							} else {
								return { ...tile, pressed: false };
							}
						} else if (
							canRevealNeighbours &&
							neighbourKeys.includes(key) &&
							isEmptyTileMark(tile.mark)
						) {
							return { ...tile, revealed: true, pressed: false };
						} else if (tile.pressed) {
							return { ...tile, pressed: false };
						}
					}
				)
			),
		],
	});

	const dicedTiles = tilesSlice$.dice(initialTile as TileState, {
		getAllKeys: (slice) => Object.keys(slice) as `${number},${number}`[],
		getNextKey: (_keys) => '0,0',
		defineInternals: (tileSlice) => {
			const tileActions = {
				depressTile: tileSlice.createAction(`${MS_TAG} ${TILE_TAG} depress`),
			};

			tileSlice.addReducers([
				minesweeperActions.tileActions.markTile.reduce((tile, payload) =>
					Coordinate.equal(tile, payload)
						? {
								...tile,
								mark: getNextTileMark(tile.mark),
								pressed: false,
						  }
						: tile
				),
				minesweeperActions.clickActions.globalMouseUp.reduce((tile) => {
					if (tile.pressed) {
						return { ...tile, pressed: false };
					} else {
						return tile;
					}
				}),
			]);
			return { tileActions };
		},
	});

	const getGameTileState = (x: number, y: number): Observable<TileState> =>
		tilesSlice$.pipe(map((tiles) => tiles[Coordinate.keyOf(x, y)]));

	const tiles$ = tilesSlice$.pipe(map((tiles) => Object.values(tiles)));

	const tilesFlagged$ = tiles$.pipe(
		map((tiles) => tiles.filter((tile) => isFlagTileMark(tile.mark)).length)
	);
	const tilesPressed$ = tiles$.pipe(map((tiles) => tiles.filter((tile) => tile.pressed)));

	const isATilePressed$ = tilesPressed$.pipe(map((tilesPressed) => tilesPressed.length > 0));

	const tileCount$ = tiles$.pipe(map((tiles) => tiles.length));

	const mineCount$ = gameSettings$.slice('mineCount');

	const remainingMines$ = combineLatest([mineCount$, tilesFlagged$]).pipe(
		map(([mineCount, tilesFlagged]) => mineCount - tilesFlagged)
	);

	const smileyState$ = combineLatest([gameState$, isATilePressed$]).pipe(
		map(([gameState, isATilePressed]) => {
			if (isATilePressed) {
				return SmileyState.SURPRISED;
			} else {
				switch (gameState) {
					case GameState.WON:
						return SmileyState.COOL;
					case GameState.LOST:
						return SmileyState.DEAD;
					default:
						return SmileyState.SMILING;
				}
			}
		})
	);

	/**
	 * Unpress all buttons if the mouse releases
	 * TODO: reevaluate
	 */
	game$.createEffect(
		merge(fromEvent(document, 'mouseup'), fromEvent(document, 'mouseleave')).pipe(
			map(() => minesweeperActions.clickActions.globalMouseUp.makePacket())
		)
	);

	/**
	 * Start the game at a safe tile and generate mines
	 */
	scope.createEffect(
		minesweeperActions.clickActions.leftclickUp.pipe(
			ifLatestFrom(gameState$, isGameReadyToStart),
			withLatestFrom(gameInstance$),
			map(([tile, preset]) =>
				minesweeperActions.startGame.makePacket({
					safeCoordinate: { x: tile.x, y: tile.y },
					mineCount: preset.settings.mineCount,
				})
			)
		)
	);

	/**
	 * Sanitize left clicks into depress
	 */
	game$.createEffect(
		minesweeperActions.clickActions.leftclickDown.pipe(
			ifLatestFrom(isGameEnded$, (isGameEnded) => !isGameEnded),
			map((click) => minesweeperActions.tileActions.depressTile.makePacket(click))
		)
	);

	/**
	 * Sanitize left clicks into reveal clicks
	 */
	game$.createEffect(
		minesweeperActions.clickActions.leftclickUp.pipe(
			ifLatestFrom(isGameEnded$, (isGameEnded) => !isGameEnded),
			map((click) => minesweeperActions.tileActions.revealTile.makePacket(click))
		)
	);

	/**
	 * Sanitize right clicks
	 */
	game$.createEffect(
		minesweeperActions.clickActions.rightclickUp.pipe(
			ifLatestFrom(isGameEnded$, (isGameEnded) => !isGameEnded),
			map((click) => minesweeperActions.tileActions.markTile.makePacket(click))
		)
	);

	/**
	 * Serving the first ticks time through a little anti cheat measure
	 * If the first time increase would always start after X amount of time
	 * if you'd refresh the page faster than that you could keep the timer at 0.
	 * This will make the timer always jump ahead a second if you refresh as
	 * without a mousedown event the initial time to tick is 0.
	 */
	const timeElapseTickrate$ = fromEvent(document, 'mousedown').pipe(
		take(1),
		map(() => TIME_TICKRATE_MS),
		startWith(0),
		shareReplay(1)
	);

	/**
	 * Elapse time
	 */
	game$.createEffect(
		gameState$.pipe(
			withLatestFrom(timeElapseTickrate$),
			switchMap(([gameState, timeElapseTickrate]) =>
				isGameOngoing(gameState)
					? timer(timeElapseTickrate, TIME_TICKRATE_MS).pipe(
							takeUntil(gameEnded$),
							map(() => true)
					  )
					: of(false)
			),
			map((running) =>
				running ? minesweeperActions.incrementTimer.makePacket(TIME_TICKRATE_MS) : undefined
			)
		)
	);

	/**
	 * Add won game to the gamehistory
	 */
	game$.createEffect(
		gameWon$.pipe(
			withLatestFrom(elapsedTime$, gameInstance$),
			map(
				([, time, gameInstance]) =>
					({
						preset: gameInstance.settings,
						time,
						cheated: gameInstance.cheated,
					} as WinData)
			),
			map((winData) => minesweeperActions.addGameToHistory.makePacket(winData))
		)
	);

	game$.createEffect(
		debug$.pipe(
			filter((debug) => debug),
			map(() => cheated$.setAction.makePacket(true))
		)
	);

	return {
		dicedTiles,
		minesweeperActions,
		game$,
		cheating$,
		smileyState$,
		remainingMines$,
		tileCount$,
		mineCount$,
		highscoreEntries$,
		presets$,
		gameInstance$,
		cheated$,
		isGameSettingsAPreset$,
		getGameTileState,
		gameWidthArray$,
		tilesSlice$,
		isGameOngoing$,
		isGameEnded$,
		gameStarted$,
		gameState$,
		gameEnded$,
		isGameSettingsNotAPreset$,
		gameHeightArray$,
		winHistory$,
		isGameLost$,
		gameLost$,
		isGameWon$,
		gameWon$,
		gameSettings$,
		elapsedTime$,
		elapsedSeconds$,
	};
};
