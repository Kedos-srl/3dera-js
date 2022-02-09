export interface IHedera {
  World: any;
  EventObject: any;
  delta_time: number;
  canvas: any;
  setCanvas(canvas: any): void;
  update(): void;
  start(canvas: any): void;
}
