import type { CoordinateLike } from '@alexaegis/desktop-common';
import type { MinesweeperGame } from '../../minesweeper/store/index.js';
import type { ProcessId, ProgramName } from '../store/desktop.store.js';

export type WindowMinimizationState =
	| boolean
	| 'start-minimizing'
	| 'minimizing'
	| 'start-unminimizing'
	| 'unminimizing';

export interface CommonProgramWindowPreferences {
	maximized: boolean;
	minimized: WindowMinimizationState;
	resizable: boolean;
	showMinimize: boolean;
	minimizeEnabled: boolean;
	showMaximize: boolean;
	maximizeEnabled: boolean;
	showClose: boolean;
	closeEnabled: boolean;
	showHelp: boolean;
	helpEnabled: boolean;
}

export interface BaseWindowState extends CommonProgramWindowPreferences {
	processId: ProcessId;
	program?: ProgramName;
	titleBarIcon: string | undefined;
	active: boolean;
	title: string;
	/**
	 * Its initial value will act as the minimum height of the window as
	 * resizable is using scollHeight as the minimum size
	 */
	height: number;
	width: number;
	position: CoordinateLike;
	minWidth: number;
	minHeight: number;
	fitContent: boolean;
	invisible: boolean;
	zIndex: number;
}

export interface ProgramWindowState<ProgramData> extends BaseWindowState {
	programData: ProgramData;
}

export interface MineSweeperWindowState extends ProgramWindowState<MinesweeperGame> {
	program: ProgramName.MINESWEEPER;
}

export type WindowState = MineSweeperWindowState | BaseWindowState;

export const defaultCommonProgramWindowPreferences: CommonProgramWindowPreferences = {
	maximized: false,
	minimized: false,
	resizable: true,
	showMinimize: true,
	minimizeEnabled: true,
	showMaximize: true,
	maximizeEnabled: true,
	showClose: true,
	closeEnabled: true,
	showHelp: false,
	helpEnabled: false,
};

export const initialWindowState: BaseWindowState = {
	...defaultCommonProgramWindowPreferences,
	processId: '-2',
	title: '...',
	titleBarIcon: '',
	active: true,
	height: 100,
	width: 80,
	position: {
		x: 200,
		y: 200,
	},
	minWidth: 120,
	minHeight: 45, // 45: titlebar and menubar together
	fitContent: false,
	invisible: false,
	zIndex: 10,
};
