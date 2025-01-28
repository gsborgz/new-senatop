import Kaplay, { KAPLAYCtx } from 'kaplay';
import { Scene, SceneTag } from './Scene';
import { Player } from './Player';
import overworldCollisionMatrix from '../assets/maps/overworld/elements/collision';
import overworldDoors from '../assets/maps/overworld/elements/doors';

export class Game {
  private scale: number = 2.5;
  private currentSceneTag: SceneTag = SceneTag.Overworld;
  private currentScene!: Scene;
  private kaplay: KAPLAYCtx<{}, never>;
  private player!: Player;
  private scenes: Scene[] = [];

  constructor() {
    this.kaplay = this.createKaplayInstance();
  }

  public start(): void {
    this.kaplay.setLayers(['background', 'game', 'foreground'], 'game');
    this.player = new Player(this.kaplay, this.scale);

    this.createScenes();

    this.setGameScene(this.currentSceneTag);

    this.player.load();

    this.player.setPosition(this.kaplay.vec2(1600, 1990));

    this.player.onCollide('door', (door) => {
      this.setGameScene(door.to);
      this.player.setPosition(door.position);
    });
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

  private createScenes(): void {
    const overworld = new Scene(this.kaplay, {
      tag: SceneTag.Overworld,
      scale: this.scale,
      // charactersMatrix: [],
      collision: overworldCollisionMatrix,
      doors: overworldDoors
    });
    const westForest = new Scene(this.kaplay, {
      tag: SceneTag.WestForest,
      scale: this.scale,
      // characters: [],
      // collision: [],
      // doors: []
    });
    const eastForest = new Scene(this.kaplay, {
      tag: SceneTag.EastForest,
      scale: this.scale,
      // characters: [],
      // collision: [],
      // doors: []
    });
    const blockA = new Scene(this.kaplay, {
      tag: SceneTag.BlockA,
      scale: this.scale,
      // characters: [],
      // collision: [],
      // doors: []
    });
    const blockB = new Scene(this.kaplay, {
      tag: SceneTag.BlockB,
      scale: this.scale,
      // characters: [],
      // collision: [],
      // doors: []
    });
    const blockC = new Scene(this.kaplay, {
      tag: SceneTag.BlockC,
      scale: this.scale,
      // characters: [],
      // collision: [],
      // doors: []
    });

    this.scenes = [overworld, westForest, eastForest, blockA, blockB, blockC];
  }

  private setGameScene(sceneTag: SceneTag): void {
    this.currentSceneTag = sceneTag;

    if (this.currentScene) {
      this.currentScene.unload();
    }

    this.currentScene = this.scenes.find((scene) => scene.tag === sceneTag)!;

    this.currentScene.load();
  }

}
