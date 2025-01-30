import Kaplay, { KAPLAYCtx } from 'kaplay';
import { SceneManager } from './SceneManager';
import { Player } from './Player';

export class Game {
  private scale: number = 2.5;
  private kaplay: KAPLAYCtx<{}, never>;
  private player!: Player;
  private sceneManager!: SceneManager;

  constructor() {
    this.kaplay = this.createKaplayInstance();
  }

  public start(): void {
    this.player = new Player(this.kaplay, this.scale);
    this.sceneManager = new SceneManager(this.kaplay, this.player, this.scale);

    this.sceneManager.init();
  }

  private createKaplayInstance(): KAPLAYCtx<{}, never> {
    return Kaplay({
      width: 800,
      height: 600,
      letterbox: true,
      global: false,
      debug: true,
      debugKey: 'f1',
      canvas: document.getElementById('game') as HTMLCanvasElement,
      pixelDensity: devicePixelRatio
    });
  }

}
