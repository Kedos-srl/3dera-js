import { IHederaCoreEntity } from './ihederacoreentity';

export interface IWorld {
  mainLoopPause(): void;
  mainLoopResume(): void;
  loadHAssetsJson(json: string): void;
  loadHAssetsHpk(arraybuffer: ArrayBuffer): void;
  loadHAassetsArchive(arraybuffer: ArrayBuffer): void;
  attachComponentRenderer(entity: IHederaCoreEntity): void;
  removeComponentRenderer(entity: IHederaCoreEntity): void;
  setCameraProjectionPerspective(
    fildOfView: number,
    nearPlane: number,
    farPlane: number
  ): void;
  setRotationCameraFirstPersonView(
    yaw: number,
    pitch: number,
    roll: number,
    speed: number
  ): void;
  rotateCameraFirstPersonView(
    yaw: number,
    pitch: number,
    roll: number,
    speed: number
  ): void;
  updateCameraFirstPersonView(smooth: number): void;
  setTargetCameraOrbitView(
    x: number,
    y: number,
    z: number,
    distance: number
  ): void;
  translateCameraOrbitView(x: number, y: number, speed: number): void;
  updateCameraOrbitView(): void;
  getCameraYaw(): number;
  getCameraPitch(): number;
  getCameraRoll(): number;
  getEntity(name: string): IHederaCoreEntity | undefined;
  entityExists(name: string): boolean;
  translate(entity: IHederaCoreEntity, x: number, y: number, z: number): void;
  setPosition(entity: IHederaCoreEntity, x: number, y: number, z: number): void;
  setSphericalPosition(
    entity: IHederaCoreEntity,
    x: number,
    y: number,
    distance: number
  ): void;
  setSphericalPositionTarget(
    entity: IHederaCoreEntity,
    x: number,
    y: number,
    target: IHederaCoreEntity,
    distance: number
  ): void;
  rotate(entity: IHederaCoreEntity, x: number, y: number, z: number): void;
  setRotation(entity: IHederaCoreEntity, x: number, y: number, z: number): void;
  followView(entity: IHederaCoreEntity): void;
  firstPersonViewLift(t: number): void;
  firstPersonViewStrafe(t: number): void;
  firstPersonViewWalk(t: number): void;
  scale(entity: IHederaCoreEntity, x: number, y: number, z: number): void;
  setScale(entity: IHederaCoreEntity, x: number, y: number, z: number): void;
  spritesheetAnimate(
    entity: IHederaCoreEntity,
    rowSize: number,
    speed: number
  ): void;
  spritesheetAnimateRepeat(
    entity: IHederaCoreEntity,
    rowSize: number,
    speed: number
  ): void;
  spritesheetAnimateRow(
    entity: IHederaCoreEntity,
    rowSize: number,
    speed: number
  ): void;
  spritesheetAnimateRowRepeat(
    entity: IHederaCoreEntity,
    rowSize: number,
    speed: number
  ): void;
  spritesheetReset(
    entity: IHederaCoreEntity,
    rowSize: number,
    speed: number
  ): void;
  enableOnScreenSelection(): void;
  selectOnScreen(entity: IHederaCoreEntity, x: number, y: number): number;
  searchOnScreen(x: number, y: number): IHederaCoreEntity;
  changeComponentColor(
    entity: IHederaCoreEntity,
    primitiveIndex: number,
    r: number,
    g: number,
    b: number,
    a: number
  ): void;
  changeComponentAlpha(
    entity: IHederaCoreEntity,
    primitiveIndex: number,
    value: number
  ): void;
  getEntiyCameraAngleRad(entity: IHederaCoreEntity): number;
  getEntiyCameraAngleDeg(entity: IHederaCoreEntity): number;
  getEntiyEntityAngleRad(
    entity: IHederaCoreEntity,
    entity2: IHederaCoreEntity
  ): number;
  getEntiyEntityAngleDeg(
    entity: IHederaCoreEntity,
    entity2: IHederaCoreEntity
  ): number;
}
