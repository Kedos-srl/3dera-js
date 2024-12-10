import JSZip from 'jszip';
import Hammer from 'hammerjs';
// @ts-ignore
import '../core/edera_0.1.js';
// @ts-ignore
import wasmBase64 from '../core/edera_0.1.wasm';
import { IHedera } from './model/ihedera';
import { IHederaCoreEntity } from './model/ihederacoreentity';
import { IHederaEntity } from './model/ihederaentity';
import { ISceneDescriptor } from './model/iscenedescriptor';
import { IWorld } from './model/iworld';

export default class HederaJS {
  private static canvas: HTMLCanvasElement;
  private static rect: DOMRect;
  private static mapEntities: Map<number, IHederaEntity> = new Map();
  private static cameraType: 'orbit' | 'fpv' = 'orbit';

  private static mousedownHandlers: ((
    e: MouseEvent,
    canvasX: number,
    canvasY: number
  ) => void)[] = [];
  private static mouseupHandlers: ((
    e: MouseEvent,
    canvasX: number,
    canvasY: number
  ) => void)[] = [];
  private static mousemoveHandlers: ((
    e: MouseEvent,
    canvasX: number,
    canvasY: number
  ) => void)[] = [];
  private static mousewheelHandlers: ((
    e: WheelEvent | any,
    canvasX: number,
    canvasY: number
  ) => void)[] = [];

  private static hexToRgb(hex: string) {
    const matches = hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r: number, g: number, b: number) => `#${r}${r}${g}${g}${b}${b}`
      )
      .substring(1)
      .match(/.{2}/g);
    if (!matches) {
      return [0, 0, 0];
    }
    return matches.map(x => parseInt(x, 16) / 255);
  }

  private static base64ToBlob(base64: string, type = 'application/wasm') {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  }

  private static enableCameraMovement() {
    let currentMouseDragX = 0;
    let currentMouseDragY = 0;
    let lastMouseDragX = 0;
    let lastMouseDragY = 0;
    let cameraZoom = 0.2; //Max: 3
    let zoomIn: boolean;
    let draggingEntity: IHederaEntity | undefined;

    // Intercetta i click
    HederaJS.onMouseDown((e: MouseEvent, canvasX: number, canvasY: number) => {
      if (e.buttons === 1) {
        lastMouseDragX = canvasX;
        lastMouseDragY = canvasY;
        const entitiesDragEnabled = Array.from(
          HederaJS.mapEntities.values()
        ).filter(entity => entity.dragEnabled);
        for (const entity of entitiesDragEnabled) {
          const coreEntity = HederaJS.getCoreEntity(entity.id);
          if (!coreEntity) {
            continue;
          }
          const entityTrovato = HederaJS.world.selectOnScreen(
            coreEntity,
            canvasX,
            canvasY
          );
          if (entityTrovato) {
            console.log('Entity trovato: ', entity);
            draggingEntity = entity;
          }
        }
      }
    });

    // Intercetta il rilascio del click
    HederaJS.onMouseUp(() => {
      draggingEntity = undefined;
    });

    // Intercetta il movimento del mouse
    HederaJS.onMouseMove((e: MouseEvent, canvasX: number, canvasY: number) => {
      // Questo setTimeout serve per evitare che l'evento onMouseMove venga chiamato prima del onMouseDown
      // Serve ad evitare il glitch grafico che si verifica quando si clicca e si muove il mouse velocemente
      setTimeout(() => {
        // Sto muovendo il mouse e ho il tasto sinistro cliccato
        currentMouseDragX = canvasX - lastMouseDragX;
        currentMouseDragY = canvasY - lastMouseDragY;
        lastMouseDragX = canvasX;
        lastMouseDragY = canvasY;

        let x = currentMouseDragX * HederaJS.deltaTime;
        let y = currentMouseDragY * HederaJS.deltaTime;

        if (e.buttons === 1) {
          if (draggingEntity) {
            x *= 0.07;
            y *= 0.07;
            HederaJS.translateEntity(draggingEntity.id, -x, -y, 0);
          } else {
            if (HederaJS.cameraType === 'orbit') {
              HederaJS.world.translateCameraOrbitView(x, y, 14);
              HederaJS.world.updateCameraOrbitView();
            } else {
              x *= 0.21;
              y *= 0.21;
              HederaJS.world.rotateCameraFirstPersonView(-x, -y, 0, 30);
              HederaJS.world.updateCameraFirstPersonView(1);
            }
          }
        }
      }, 10);
    });

    HederaJS.onMouseWheel((e: WheelEvent) => {
      zoomIn = e.deltaY < 0;

      if (zoomIn && cameraZoom < 3) {
        cameraZoom += 0.2;
      } else if (!zoomIn && cameraZoom > 0.2) {
        cameraZoom -= 0.2;
      }

      if (HederaJS.cameraType === 'orbit') {
        HederaJS.world.setTargetCameraOrbitView(0, 0, 0, cameraZoom + 20);
        HederaJS.world.updateCameraOrbitView();
      } else {
        /* 
          Calcolo del fov partendo dal cameraZoom:
          CameraZoom 0.2 -> fov 48
          CameraZoom 3 -> fov 90
        */
        const fov = 90 - (cameraZoom - 0.2) * 15;
        HederaJS.world.setCameraProjectionPerspective(fov, 0.1, 300);
        HederaJS.world.updateCameraFirstPersonView(0);
      }
    });

    const hammerCanvas = new Hammer(HederaJS.canvas, {});
    hammerCanvas.get('pinch').set({ enable: true });
    hammerCanvas.on('pinch', (event: HammerInput) => {
      if (event.scale > 1 && cameraZoom < 3) {
        cameraZoom += (event.scale - 1) * 0.2;
      } else if (event.scale < 1 && cameraZoom > 0.2) {
        cameraZoom -= (1 - event.scale) * 0.2;
      }

      if (HederaJS.cameraType === 'orbit') {
        HederaJS.world.setTargetCameraOrbitView(0, 0, 0, cameraZoom + 20);
        HederaJS.world.updateCameraOrbitView();
      } else {
        /* 
          Calcolo del fov partendo dal cameraZoom:
          CameraZoom 0.2 -> fov 48
          CameraZoom 3 -> fov 90
        */
        const fov = 90 - (cameraZoom - 0.2) * 15;
        HederaJS.world.setCameraProjectionPerspective(fov, 0.1, 300);
        HederaJS.world.updateCameraFirstPersonView(0);
      }
    });
  }

  private static loadAssets(params: {
    arrayBuffer: ArrayBuffer;
    type: string;
  }) {
    HederaJS.world.mainLoopPause();

    if (params.type === 'HPK') {
      HederaJS.world.loadHAssetsHpk(params.arrayBuffer);
    } else if (params.type === 'ZIP') {
      HederaJS.world.loadHAassetsArchive(params.arrayBuffer);
    } else {
      console.error('Invalid asset type:' + params.type);
    }
    HederaJS.world.enableOnScreenSelection();
    HederaJS.world.mainLoopResume();
  }

  /**
   * @param id - Entity ID
   * @returns {id: number} - Entity Core of HederaJS, contains only the internal id of Hedera
   */
  private static getCoreEntity(id: string): IHederaCoreEntity | undefined {
    const coreEntity = HederaJS.world.getEntity(id);
    if (!coreEntity || coreEntity.id === undefined || coreEntity.id == null) {
      console.error('Core Entity not found for id: ' + id);
    }
    return coreEntity;
  }

  /************************************************  PUBLIC  *********************************************/

  public static Hedera: IHedera = (window as { [key: string]: any })['Hedera'];
  public static world: IWorld;

  /**
   * Returns the time elapsed since the last frame
   */
  public static get deltaTime(): number {
    return HederaJS.Hedera.delta_time;
  }

  /**
   * Associate a function to be performed with each frame of Hedera rendering
   */
  public static onUpdate(updateHandler: () => void): void {
    HederaJS.Hedera.update = updateHandler;
  }

  /**
   * Associates a function to be performed on mouse button release or touchend from mobile
   */
  public static onMouseUp(
    mouseupHandler: (e: MouseEvent, canvasX: number, canvasY: number) => void
  ): void {
    HederaJS.mouseupHandlers.push(mouseupHandler);
  }

  /**
   * Associates a function to be performed with mouse button click or touchstart from mobile
   */
  public static onMouseDown(
    mousedownHandler: (e: MouseEvent, canvasX: number, canvasY: number) => void
  ): void {
    HederaJS.mousedownHandlers.push(mousedownHandler);
  }

  /**
   * Associates a function to be performed with mouse movement or touchmove from mobile
   */
  public static onMouseMove(
    mousemoveHandler: (e: MouseEvent, canvasX: number, canvasY: number) => void
  ): void {
    HederaJS.mousemoveHandlers.push(mousemoveHandler);
  }

  /**
   * Associates a function to be performed with the rotation of the mouse wheel or pinch from mobile
   */
  public static onMouseWheel(
    mousewheelHandler: (
      e: WheelEvent | any,
      canvasX: number,
      canvasY: number
    ) => void
  ): void {
    HederaJS.mousewheelHandlers.push(mousewheelHandler);
  }

  /**
   * HederaJS initialization, to be called only once at application startup
   */
  public static async init(canvas: HTMLCanvasElement): Promise<IHedera> {
    return new Promise(function (resolve) {
      canvas.getContext('webgl', { premultipliedAlpha: true });
      canvas.addEventListener('contextmenu', e => e.preventDefault());
      HederaJS.canvas = canvas;

      const base64Clean = wasmBase64.replace(
        /^data:[a-zA-Z]*\/[a-zA-Z]*;base64,/,
        ''
      );
      const wasmBlob = HederaJS.base64ToBlob(base64Clean);
      const wasmUrl = URL.createObjectURL(wasmBlob);

      (window as any).Hedera.start(canvas, wasmUrl);
      window.addEventListener('on_hedera_startup', () => {
        HederaJS.Hedera = (window as any).Hedera;
        HederaJS.Hedera.update = () => undefined;
        resolve(HederaJS.Hedera);
        HederaJS.rect = canvas.getBoundingClientRect();
      });

      window.addEventListener(
        'resize',
        () => {
          HederaJS.canvas.width =
            HederaJS.canvas.clientWidth * window.devicePixelRatio;
          HederaJS.canvas.height =
            HederaJS.canvas.clientHeight * window.devicePixelRatio;
          HederaJS.rect = canvas.getBoundingClientRect();
        },
        true
      );
    });
  }

  /**
   * Starting HederaJS, make sure you have called the HederaJS.init method first.
   * @param cameraType Type of camera to be used, 'orbit' for orbital camera, 'fpv' for first-person camera
   */
  public static start(cameraType: 'orbit' | 'fpv'): void {
    HederaJS.canvas.width =
      HederaJS.canvas.clientWidth * window.devicePixelRatio;
    HederaJS.canvas.height =
      HederaJS.canvas.clientHeight * window.devicePixelRatio;
    /*const gl = HederaJS.canvas.getContext('webgl', {
      premultipliedAlpha: false,
    });*/

    const scaleX = HederaJS.canvas.width / HederaJS.rect.width;
    const scaleY = HederaJS.canvas.height / HederaJS.rect.height;

    HederaJS.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      const canvasX = (e.x - HederaJS.rect.left) * scaleX;
      const canvasY = (e.y - HederaJS.rect.top) * scaleY;
      HederaJS.mousedownHandlers.forEach(mouseDownHandler => {
        mouseDownHandler(e, canvasX, canvasY);
      });
    });

    HederaJS.canvas.addEventListener('touchstart', (e: TouchEvent) => {
      HederaJS.mousedownHandlers.forEach(mouseDownHandler => {
        const canvasX = (e.touches[0].clientX - HederaJS.rect.left) * scaleX;
        const canvasY = (e.touches[0].clientY - HederaJS.rect.top) * scaleY;
        const mouseEvent = new MouseEvent('mousedown', {
          ...e,
          buttons: 1,
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        });
        mouseDownHandler(mouseEvent, canvasX, canvasY);
      });
    });

    HederaJS.canvas.addEventListener('mouseup', (e: MouseEvent) => {
      const canvasX = (e.x - HederaJS.rect.left) * scaleX;
      const canvasY = (e.y - HederaJS.rect.top) * scaleY;
      HederaJS.mouseupHandlers.forEach(mouseUpHandler => {
        mouseUpHandler(e, canvasX, canvasY);
      });
    });

    HederaJS.canvas.addEventListener('touchend', (e: TouchEvent) => {
      HederaJS.mouseupHandlers.forEach(mouseUpHandler => {
        const canvasX =
          (e.changedTouches[0].clientX - HederaJS.rect.left) * scaleX;
        const canvasY =
          (e.changedTouches[0].clientY - HederaJS.rect.top) * scaleY;
        const mouseEvent = new MouseEvent('mouseup', {
          ...e,
          buttons: 1,
          clientX: e.changedTouches[0].clientX,
          clientY: e.changedTouches[0].clientY,
        });
        mouseUpHandler(mouseEvent, canvasX, canvasY);
      });
    });

    HederaJS.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const canvasX = (e.x - HederaJS.rect.left) * scaleX;
      const canvasY = (e.y - HederaJS.rect.top) * scaleY;
      HederaJS.mousemoveHandlers.forEach(mouseMoveHandler => {
        mouseMoveHandler(e, canvasX, canvasY);
      });
    });

    HederaJS.canvas.addEventListener('touchmove', (e: TouchEvent) => {
      const canvasX = (e.touches[0].clientX - HederaJS.rect.left) * scaleX;
      const canvasY = (e.touches[0].clientY - HederaJS.rect.top) * scaleY;
      HederaJS.mousemoveHandlers.forEach(mouseMoveHandler => {
        const mouseEvent = new MouseEvent('mousemove', {
          ...e,
          buttons: 1,
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        });
        if (e.touches.length === 1) {
          mouseMoveHandler(mouseEvent, canvasX, canvasY);
        }
      });
    });

    HederaJS.canvas.addEventListener('wheel', (e: WheelEvent) => {
      const canvasX = (e.x - HederaJS.rect.left) * scaleX;
      const canvasY = (e.y - HederaJS.rect.top) * scaleY;
      HederaJS.mousewheelHandlers.forEach(mousewheelHandler => {
        mousewheelHandler(e, canvasX, canvasY);
      });
    });

    const hammerCanvas = new Hammer(HederaJS.canvas, {});
    hammerCanvas.on('pinch', (event: HammerInput) => {
      const canvasX = (event.center.x - HederaJS.rect.left) * scaleX;
      const canvasY = (event.center.y - HederaJS.rect.top) * scaleY;
      HederaJS.mousewheelHandlers.forEach(mousewheelHandler => {
        mousewheelHandler(event, canvasX, canvasY);
      });
    });

    HederaJS.Hedera.update();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    HederaJS.world = new (HederaJS.Hedera as any).World();
    HederaJS.cameraType = cameraType;

    HederaJS.enableCameraMovement();
    if (cameraType === 'orbit') {
      HederaJS.world.setTargetCameraOrbitView(0, 0, 0, 20);
      HederaJS.world.setCameraProjectionPerspective(45, 0.1, 300);
      HederaJS.world.updateCameraOrbitView();
    } else {
      HederaJS.world.setRotationCameraFirstPersonView(0, 0, 0, 0);
      HederaJS.world.setCameraProjectionPerspective(45, 0.1, 300);
      HederaJS.world.updateCameraFirstPersonView(1);
    }
  }

  /**
   * Load a scene into HederaJS.
   * @param jsonData JSON file containing the description of the scene ( images, 3D models, rooms, widgets, spritesheets )
   * @param assetsUrls Array of strings containing the URLs of the assets to be loaded.
   * @returns {Promise<boolean>} - True if the scene has been loaded correctly, false otherwise
   */
  public static async loadScene(
    jsonData: ISceneDescriptor,
    assetsUrls: string[]
  ): Promise<boolean> {
    const zip = new JSZip();
    zip.file('data.json', JSON.stringify(jsonData));
    for (const url of assetsUrls) {
      const filename = url.split('/').pop();
      const file = await fetch(url);
      if (file.ok && filename) {
        zip.file(filename, file.blob());
      } else {
        console.error('Error loading file: ' + url);
        return false;
      }
    }
    const zipHedera = await zip.generateAsync({ type: 'arraybuffer' });

    this.loadAssets({ arrayBuffer: zipHedera, type: 'ZIP' });

    this.mapEntities.clear();
    for (const room of jsonData.collectors.rooms) {
      const coreEntity = HederaJS.getCoreEntity(room.id);
      if (coreEntity) {
        this.mapEntities.set(coreEntity.id, {
          id: room.id,
          position: { x: 0, y: 0 },
          rotation: {
            x: room.rotation[0],
            y: room.rotation[1],
            z: room.rotation[2],
          },
          scale: { x: room.size, y: room.size, z: room.size },
          distance: undefined,
          alpha: 1,
          visible: room.renderable,
          dragEnabled: false,
        });
      }
    }
    for (const widget of jsonData.collectors.widgets) {
      const coreEntity = HederaJS.getCoreEntity(widget.id);
      if (coreEntity) {
        this.mapEntities.set(+coreEntity.id, {
          id: widget.id,
          position: { x: widget.position[0], y: widget.position[1] },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: widget.size[0], y: widget.size[1], z: widget.size[2] },
          distance: widget.distance,
          alpha: 1,
          visible: widget.renderable,
          dragEnabled: false,
        });
      }
    }
    for (const spritesheet of jsonData.collectors.spritesheets) {
      const coreEntity = HederaJS.getCoreEntity(spritesheet.id);
      if (coreEntity) {
        this.mapEntities.set(+coreEntity.id, {
          id: spritesheet.id,
          position: { x: spritesheet.sprite[0], y: spritesheet.sprite[1] },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: spritesheet.size[0], y: spritesheet.size[1], z: 1 },
          distance: undefined,
          alpha: 1,
          visible: spritesheet.renderable,
          dragEnabled: false,
        });
      }
    }
    return true;
  }

  /**
   * Associate a function to execute to the hover on a widget.
   * @param widgetId Id of the widget on which to intercept the hover.
   * @param callback Function to execute when event occurs, parameter passed: widgetTried: {id} of widget found or null and, mouseEvent
   */
  public static handleEntityHover(
    callback: (
      idEntityTrovata: IHederaEntity | undefined,
      mouseEvent: MouseEvent
    ) => void
  ): void {
    HederaJS.onMouseMove((mouseEvent: MouseEvent) => {
      const scaleX = HederaJS.canvas.width / HederaJS.rect.width;
      const scaleY = HederaJS.canvas.height / HederaJS.rect.height;
      const canvasX = (mouseEvent.x - HederaJS.rect.left) * scaleX;
      const canvasY = (mouseEvent.y - HederaJS.rect.top) * scaleY;
      const entity = HederaJS.world.searchOnScreen(canvasX, canvasY);
      if (entity) {
        callback(this.mapEntities.get(entity.id), mouseEvent);
      } else {
        callback(undefined, mouseEvent);
      }
    });
  }

  /**
   * Associate a function to be executed when a widget is clicked on.
   * @param widgetId Id of the widget to intercept the click on.
   * @param callback Function to execute when event occurs, parameter passed: widgetTried: 0|1 if widget was found at mouse position, mouseEvent
   */
  public static handleWidgetMouseDown(
    widgetId: string,
    callback: (widgetTrovato: number, mouseEvent: MouseEvent) => void
  ): void {
    const coreEntity = HederaJS.getCoreEntity(widgetId);
    if (coreEntity) {
      HederaJS.onMouseDown(
        (e: MouseEvent, canvasX: number, canvasY: number) => {
          const widgetTrovato = HederaJS.world.selectOnScreen(
            coreEntity,
            canvasX,
            canvasY
          );
          callback(widgetTrovato, e);
        }
      );
    }
  }

  /**
   * Associate a function to execute on click release on a widget.
   * @param widgetId Id of widget on which to intercept click release.
   * @param callback Function to execute when event occurs, parameter passed: widgetTried: 0|1 if widget was found at mouse position, mouseEvent
   */
  public static handleWidgetMouseUp(
    widgetId: string,
    callback: (widgetTrovato: number, mouseEvent: MouseEvent) => void
  ): void {
    const coreEntity = HederaJS.getCoreEntity(widgetId);
    if (coreEntity) {
      HederaJS.onMouseUp((e: MouseEvent, canvasX: number, canvasY: number) => {
        const widgetTrovato = HederaJS.world.selectOnScreen(
          coreEntity,
          canvasX,
          canvasY
        );
        callback(widgetTrovato, e);
      });
    }
  }

  /**
   * Sets the camera view.
   * @param x position for orbital camera, yaw (yaw) for first-person camera (0-360)
   * @param y position y for orbital camera, pitch (pitch) for first-person camera (0-360)
   * @param z position z for orbital chamber, roll for first-person chamber (0-360)
   */
  public static setCameraPosition(x: number, y: number, z = 0): void {
    if (HederaJS.cameraType === 'orbit') {
      HederaJS.world.setTargetCameraOrbitView(x, -y, z, 1);
      HederaJS.world.updateCameraOrbitView();
    } else {
      HederaJS.world.setRotationCameraFirstPersonView(x, -y, z, 1);
      HederaJS.world.updateCameraFirstPersonView(1);
    }
  }

  /**
   * Sets the field of view of the camera (adjusts the zoom of the view).
   * @param fov Value of the field of view, between 0 and 360
   */
  public static setCameraFov(fov: number): void {
    HederaJS.world.setCameraProjectionPerspective(fov, 0.1, 300);
    if (HederaJS.cameraType === 'orbit') {
      HederaJS.world.updateCameraOrbitView();
    } else {
      HederaJS.world.updateCameraFirstPersonView(1);
    }
  }

  /**
   * Returns an entity from its id.
   * @param entityId Entity ID.
   * @returns {IHederaEntity} Entity
   */
  public static getEntity(entityId: string): IHederaEntity | undefined {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      return this.mapEntities.get(coreEntity.id);
    }
    return undefined;
  }

  /**
   * Adds an entity to the rendering queue, making it visible.
   * @param widgetId Entity ID.
   */
  public static showEntity(entityId: string): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const entity = this.mapEntities.get(coreEntity.id);
      if (entity) {
        entity.visible = true;
      }
      HederaJS.world.attachComponentRenderer(coreEntity);
    }
  }

  /**
   * Removes an entity from the rendering queue, making it invisible.
   * @param widgetId Entity ID.
   */
  public static hideEntity(entityId: string): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const entity = this.mapEntities.get(coreEntity.id);
      if (entity) {
        entity.visible = false;
      }
      HederaJS.world.removeComponentRenderer(coreEntity);
    }
  }

  /**
   * Set the color of an entity
   * @param entityId Entity ID.
   * @param color Color in hexadecimal format (#RRGGBB).
   * @param alpha Color transparency (0-1)
   */
  public static setEntityColor(
    entityId: string,
    color: string,
    alpha = 1
  ): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const [r, g, b] = this.hexToRgb(color);
      HederaJS.world.changeComponentColor(coreEntity, 0, r, g, b, alpha);
    }
  }

  /**
   * Set transparency of an entity
   * @param entityId Entity ID
   * @param alpha Transparency value (0-1)
   */
  public static setEntityAlpha(entityId: string, alpha: number): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const entity = this.mapEntities.get(coreEntity.id);
      if (entity) {
        entity.alpha = alpha;
      }
      HederaJS.world.changeComponentAlpha(coreEntity, 0, alpha);
    }
  }

  /**
   * Sets the size of an entity.
   * @param entityId Entity ID.
   * @param scale Scale value (0-X): 1 = original size, 2 = double size, 0.5 = half size
   */
  public static setEntitySize(entityId: string, scale: number): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const entity = this.mapEntities.get(coreEntity.id);
      if (entity) {
        entity.scale = { x: scale, y: scale, z: scale };
      }
      HederaJS.world.setScale(coreEntity, scale, scale, scale);
    } else {
      console.error('Entity not found for id: ' + entityId);
    }
  }

  /**
   * Sets the position of an entity, in the case of orbital chamber, sets the spherical position, otherwise the spatial position
   * @param entityId Entity ID.
   * @param x Position x - if not specified, keeps current position
   * @param y Position y - if not specified, keeps current position
   * @param distance Distance - if not specified, keeps current distance
   */
  public static setEntityPosition(
    entityId: string,
    x?: number,
    y?: number,
    distance?: number
  ): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const entity = this.mapEntities.get(coreEntity.id);
      if (entity) {
        entity.position.x = x ?? entity.position.x;
        entity.position.y = y ?? entity.position.y;
        entity.distance = distance ?? entity.distance;
        HederaJS.world.setSphericalPosition(
          coreEntity,
          entity.position.x,
          entity.position.y,
          distance || 0
        );
      }
    }
  }

  /**
   * Moves an entity by a specified quantity.
   * @param entityId Entity ID
   * @param x Move x
   * @param y Move y
   * @param distance Increment
   */
  public static translateEntity(
    entityId: string,
    x = 0,
    y = 0,
    distance = 0
  ): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const entity = this.mapEntities.get(coreEntity.id);
      if (entity) {
        entity.position.x += x;
        entity.position.y += y;
        if (entity.distance) {
          entity.distance += distance;
        }
        HederaJS.world.setSphericalPosition(
          coreEntity,
          entity.position.x,
          entity.position.y,
          entity.distance || 0
        );
      }
    }
  }

  /**
   * Sets the position of an entity, in the case of orbital chamber, sets the spherical position, otherwise the spatial position
   * @param entityId Entity ID.
   * @param x Rotation x yaw (yaw) (0-360) - if not specified, keeps current rotation
   * @param y Rotation y pitch (pitch) (0-360) - if not specified, retains current rotation
   * @param z Rotation z roll (roll) (0-360) - if not specified, keeps current rotation
   */
  public static setEntityRotation(
    entityId: string,
    x?: number,
    y?: number,
    z?: number
  ): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const entity = this.mapEntities.get(coreEntity.id);
      if (entity) {
        entity.rotation.x = x ?? entity.rotation.x;
        entity.rotation.y = y ?? entity.rotation.y;
        entity.rotation.z = z ?? entity.rotation.z;
        HederaJS.world.setRotation(
          coreEntity,
          entity.rotation.x,
          entity.rotation.y,
          entity.rotation.z
        );
      }
    }
  }

  /**
   * Rotates an entity by a specified quantity.
   * @param entityId Entity ID
   * @param x Rotation x yaw (yaw).
   * @param y Rotation y pitch (pitch).
   * @param z Rotation z roll (roll).
   */
  public static rotateEntity(entityId: string, x = 0, y = 0, z = 0): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (coreEntity) {
      const entity = this.mapEntities.get(coreEntity.id);
      if (entity) {
        HederaJS.world.rotate(
          coreEntity,
          entity.rotation.x,
          entity.rotation.y,
          entity.rotation.z
        );
        entity.rotation.x += x;
        entity.rotation.y += y;
        entity.rotation.z += z;
      }
    }
  }

  /**
   * Set an entity as draggable by holding down the left mouse button.
   * @param entityId Entity ID.
   * @param dragEnabled Enables or disables entity drag.
   */
  public static setEntityDraggable(
    entityId: string,
    dragEnabled: boolean
  ): void {
    const coreEntity = HederaJS.getCoreEntity(entityId);
    if (!coreEntity) {
      return;
    }
    const entity = this.mapEntities.get(coreEntity.id);
    if (entity) {
      entity.dragEnabled = dragEnabled;
    }
  }
}
