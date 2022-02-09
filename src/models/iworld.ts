export interface IWorld {
  mainLoopPause(): any;
  mainLoopResume(): any;
  loadHAssetsJson(json: any): any;
  loadHAssetsHpk(arraybuffer: any): any;
  loadHAassetsArchive(arraybuffer: any): any;
  attachComponentRenderer(entity: any): any;
  removeComponentRenderer(entity: any): any;
  setCameraProjectionPerspective(
    fildOfView: any,
    nearPlane: any,
    farPlane: any
  ): any;
  setRotationCameraFirstPersonView(
    yaw: any,
    pitch: any,
    roll: any,
    speed: any
  ): any;
  rotateCameraFirstPersonView(yaw: any, pitch: any, roll: any, speed: any): any;
  updateCameraFirstPersonView(smooth: any): any;
  setTargetCameraOrbitView(x: any, y: any, z: any, distance: any): any;
  translateCameraOrbitView(x: any, y: any, speed: any): any;
  updateCameraOrbitView(): any;
  getCameraYaw(): any;
  getCameraPitch(): any;
  getCameraRoll(): any;
  getEntity(name: any): any;
  entityExists(name: any): any;
  translate(entity: any, x: any, y: any, z: any): any;
  setPosition(entity: any, x: any, y: any, z: any): any;
  setSphericalPosition(entity: any, x: any, y: any, distance: any): any;
  setSphericalPositionTarget(
    entity: any,
    x: any,
    y: any,
    z: any,
    target: any,
    distance: any
  ): any;
  rotate(entity: any, x: any, y: any, z: any): any;
  setRotation(entity: any, x: any, y: any, z: any): any;
  followView(entity: any): any;
  firstPersonViewLift(t: any): any;
  firstPersonViewWalk(t: any): any;
  scale(entity: any, x: any, y: any, z: any): any;
  setScale(entity: any, x: any, y: any, z: any): any;
  spritesheetAnimate(entity: any, rowSize: any, speed: any): any;
  spritesheetAnimateRepeat(entity: any, rowSize: any, speed: any): any;
  spritesheetAnimateRow(entity: any, rowSize: any, speed: any): any;
  spritesheetAnimateRowRepeat(entity: any, rowSize: any, speed: any): any;
  spritesheetReset(entity: any, rowSize: any, speed: any): any;
  enableOnScreenSelection(): any;
  selectOnScreen(entity: any, x: any, y: any): any;
  searchOnScreen(x: any, y: any): any;
  changeComponentColor(
    entity: any,
    primitiveIndex: any,
    r: any,
    g: any,
    b: any,
    a: any
  ): any;
  changeComponentAlpha(entity: any, primitiveIndex: any, value: any): any;
  getEntiyCameraAngleRad(entity: any): any;
  getEntiyCameraAngleDeg(entity: any): any;
  getEntiyEntityAngleRad(entity: any, entity2: any): any;
  getEntiyEntityAngleDeg(entity: any, entity2: any): any;
}
