export interface IHederaEntity {
  id: string;
  position: { x: number; y: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  distance: number | undefined;
  alpha: number;
  visible: boolean;
  dragEnabled: boolean;
}
