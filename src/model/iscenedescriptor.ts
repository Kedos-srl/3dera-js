export interface ISceneDescriptor {
  assets: {
    images: {
      id: string;
      type: 'img' | 'panorama';
      ibl: 'low' | 'mid' | 'high';
      alpha: 'opaque' | 'blend' | 'mask';
      mask: number;
      url: number;
    }[];
    glb: {
      url: number;
    }[];
    url: string[];
  };
  collectors: {
    rooms: {
      id: string;
      image_id: string;
      size: number;
      renderable: boolean;
      rotation: number[];
    }[];
    widgets: {
      id: string;
      image_id: string;
      size: number[];
      distance: number;
      position: number[];
      off_scene: number;
      mask: number;
      renderable: boolean;
    }[];
    spritesheets: {
      id: string;
      image_id: string;
      frames: number;
      sprite: number[];
      size: number[];
      renderable: boolean;
    }[];
  };
}
