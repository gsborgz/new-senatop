import Kaplay, { KAPLAYCtx } from 'kaplay';

export class Game {
  private scale: number = 2.5;

  public start(): void {
    const kaplay = this.createKaplayInstance();

    kaplay.setLayers(['background', 'game', 'foreground'], 'game');

    kaplay.loadSprite('background', 'src/assets/maps/overworld/background.png');
    kaplay.loadSprite('foreground', 'src/assets/maps/overworld/foreground.png');

    kaplay.add([kaplay.sprite("background"), kaplay.pos(0, 0), kaplay.scale(this.scale), kaplay.layer('background')]);
    kaplay.add([kaplay.sprite("foreground"), kaplay.pos(0, 0), kaplay.scale(this.scale), kaplay.layer('foreground')]);
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
