export const enum GameState {
	READY_TO_START = 'ready',
	ONGOING = 'ongoing',
	WON = 'won',
	LOST = 'lost',
}

export const isGameReadyToStart = (mark: GameState): mark is GameState.READY_TO_START =>
	mark === GameState.READY_TO_START;
export const isGameOngoing = (mark: GameState): mark is GameState.ONGOING =>
	mark === GameState.ONGOING;
export const isGameWon = (mark: GameState): mark is GameState.WON => mark === GameState.WON;
export const isGameLost = (mark: GameState): mark is GameState.LOST => mark === GameState.LOST;
