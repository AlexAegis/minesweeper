export enum TileMark {
	EMPTY = '_',
	FLAG = '!',
	QUESTION = '?',
}

export const isEmptyTileMark = (mark?: TileMark): mark is TileMark.EMPTY => mark === TileMark.EMPTY;
export const isFlagTileMark = (mark?: TileMark): mark is TileMark.FLAG => mark === TileMark.FLAG;
export const isQuestionTileMark = (mark?: TileMark): mark is TileMark.QUESTION =>
	mark === TileMark.QUESTION;

export const getNextTileMark = (mark?: TileMark): TileMark => {
	if (mark && isEmptyTileMark(mark)) {
		return TileMark.FLAG;
	} else if (mark && isFlagTileMark(mark)) {
		return TileMark.QUESTION;
	} else {
		return TileMark.EMPTY;
	}
};
