/**
 * @jest-environment jsdom
 */
import { IHedera } from './models/ihedera';
import { IWorld } from './models/iworld';

export default class HederaJS {
  public static world: IWorld;
  private static canvas: HTMLCanvasElement;
  private static Hedera: IHedera = (window as { [key: string]: any })[
    'Hedera'
  ] as IHedera;
  private static mousedownHandlers: ((e: MouseEvent) => void)[] = [];
  private static mousemoveHandlers: ((e: MouseEvent) => void)[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static async init(canvas: HTMLCanvasElement): Promise<IHedera> {
    return new Promise(function (resolve) {
      canvas.getContext('webgl', { premultipliedAlpha: false });
      HederaJS.canvas = canvas;

      HederaJS.Hedera.start(canvas);
      window.addEventListener('on_hedera_startup', () => {
        HederaJS.Hedera = (window as { [key: string]: any })['Hedera'];
        HederaJS.Hedera.update = () => {
          console.log('this should be replaced');
        };
        resolve(HederaJS.Hedera);
      });
    });
  }
  public static async start(): Promise<boolean> {
    return new Promise(function (resolve) {
      HederaJS.canvas.width = HederaJS.canvas.clientWidth;
      HederaJS.canvas.height = HederaJS.canvas.clientHeight;
      HederaJS.canvas.getContext('webgl', {
        premultipliedAlpha: false,
      });
      window.addEventListener(
        'resize',
        () => {
          const parent = HederaJS.canvas.parentElement;
          if (parent) {
            HederaJS.canvas.width = parent.clientWidth;
            HederaJS.canvas.height = parent.clientHeight;
          }
        },
        true
      );

      HederaJS.canvas.addEventListener('mousedown', (e: MouseEvent) => {
        HederaJS.mousedownHandlers.forEach(mouseDownHandler => {
          mouseDownHandler(e);
        });
      });

      HederaJS.canvas.addEventListener('mousemove', (e: MouseEvent) => {
        HederaJS.mousemoveHandlers.forEach(mouseMoveHandler => {
          mouseMoveHandler(e);
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      HederaJS.world = new HederaJS.Hedera.World();

      // HederaJS.world.setCameraProjectionPerspective(45, 0.1, 1000);
      // HederaJS.world.setTargetCameraOrbitView(0, 0, 0, 25);
      // HederaJS.world.translateCameraOrbitView(0, 0, 0);
      // HederaJS.world.updateCameraOrbitView();
      resolve(true);
    });
  }

  public static onUpdate(updateHandler: () => void): void {
    HederaJS.Hedera.update = updateHandler;
  }

  public static onMouseDown(mousedownHandler: (e: MouseEvent) => void): void {
    HederaJS.mousedownHandlers.push(mousedownHandler);
  }

  public static onMouseMove(mousemoveHandler: (e: MouseEvent) => void): void {
    HederaJS.mousemoveHandlers.push(mousemoveHandler);
  }

  /**
   * Download del file dalla URL indicata e caricamento nel world corrente
   * @param params
   * @returns
   */
  public static async fetchAndLoadAssets(params: {
    url: string;
    type?: string;
  }): Promise<{
    status: boolean;
    statusText: string;
  }> {
    if (!params.type) {
      params.type = 'ZIP';
    }
    HederaJS.world.mainLoopPause();

    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', params.url, true);
      xhr.responseType = 'arraybuffer';

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const arrayBuffer = xhr.response;
          if (params.type === 'HPK') {
            HederaJS.world.loadHAssetsHpk(arrayBuffer);
          } else if (params.type === 'ZIP') {
            HederaJS.world.loadHAassetsArchive(arrayBuffer);
          } else {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.error(`Invalid asset type: ${params.type}`);
          }
          HederaJS.world.mainLoopResume();
          resolve({
            status: true,
            statusText: 'OK',
          });
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      };

      xhr.send(null);
    });
  }

  public static getDeltaTime(): number {
    return HederaJS.Hedera.delta_time;
  }

  public static hexToRgb(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return [r, g, b];
    }
    return [0, 0, 0];
  }
}
