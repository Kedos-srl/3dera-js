import { IWorld } from './iworld';

export interface IHedera {
  World: IWorld;
  Entity: number;
  EventObject: any;
  delta_time: number;
  canvas: HTMLCanvasElement;
  setCanvas(canvas: HTMLCanvasElement): void;
  update(): void;
  start(canvas: HTMLCanvasElement, wasmLocation?: string): void;
}
