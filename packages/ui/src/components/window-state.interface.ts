import type { CoordinateLike } from '@w2k/common';
import type { ComponentType } from 'svelte';
import type { ProcessId, ProgramId } from '../store/desktop.store.js';

export interface WindowComponents {
	menu?: ComponentType;
	/**
	 * TODO: maybe rename this to body or windowContent
	 */
	content: ComponentType;
}

export type WindowMinimizationState =
	| boolean
	| 'start-minimizing'
	| 'minimizing'
	| 'start-unminimizing'
	| 'unminimizing';

// TODO: combine these two states as a generic animated boolean, boolean "start-forward" forward, start-backwards, backwards
export type WindowMaximizationState =
	| boolean
	| 'start-maximizing'
	| 'maximizing'
	| 'start-restoring'
	| 'restoring';

export interface CommonProgramWindowPreferences {
	maximized: WindowMaximizationState;
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
	program?: ProgramId;
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

export type WindowState = BaseWindowState;

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
	height: 0,
	width: 0,
	position: {
		x: 160,
		y: 120,
	},
	minWidth: 120,
	minHeight: 45, // 45: titlebar and menubar together
	fitContent: false,
	invisible: false,
	zIndex: 10,
};
