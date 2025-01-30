import { AreaComp, BodyComp, GameObj, KAPLAYCtx, LayerComp, PosComp, RectComp, ScaleComp, SpriteComp, Vec2 } from 'kaplay';
import { Player } from './Player';
import overworldDoors from '../assets/maps/overworld/elements/doors';
import blockADoors from '../assets/maps/block-a/elements/doors';
import overworldBoundariesMatrix from '../assets/maps/overworld/elements/boundaries';

type Scenario = GameObj<SpriteComp | PosComp | ScaleComp | LayerComp>;

export type DoorConfig = {
  matrix: SceneTag[][];
  newPlayerPosition: Record<string, { x: number, y: number }>;
}

export enum SceneTag {
  Overworld = 'overworld',
  BlockA = 'block-a',
  BlockB = 'block-b',
  BlockC = 'block-c',
  WestForest = 'west-forest',
  EastForest = 'east-forest'
}

export enum DoorCode {
  Overworld = 1,
  BlockA = 2,
  BlockB = 3,
  BlockC = 4,
  WestForest = 5,
  EastForest = 6
}

type DoorObject = GameObj<PosComp | LayerComp | DoorObj | AreaComp | BodyComp | RectComp>;

export type DoorObj = {
  to: SceneTag;
  position: Vec2;
}

export class SceneManager {

  private currentScene: SceneTag = SceneTag.Overworld;

  constructor(
    private readonly kaplay: KAPLAYCtx<{}, never>,
    private readonly player: Player,
    private readonly scale: number
  ) { }

  public init(): void {
    this.kaplay.setLayers(['background', 'game', 'foreground'], 'game');

    this.createScenes();

    this.kaplay.go(this.currentScene, { playerPosition: this.kaplay.vec2(1600, 1990) });
  }

  private objectIsInsideRenderArea(elementPosition: Vec2, renderArea: GameObj): boolean {
    const renderAreaSize = renderArea.width;
    const renderAreaPos = renderArea.pos;

    const isInsideX = (elementPosition.x + 16 * this.scale) >= renderAreaPos.x - renderAreaSize / 2 &&
      elementPosition.x <= renderAreaPos.x + renderAreaSize / 2;
    const isInsideY = (elementPosition.y + 16 * this.scale) >= renderAreaPos.y - renderAreaSize / 2 &&
      elementPosition.y <= renderAreaPos.y + renderAreaSize / 2;

    return isInsideX && isInsideY;
  }

  private updateInvisibleObjectsArea(renderArea: GameObj): void {
    renderArea.pos = this.kaplay.vec2(this.player.position.x, this.player.position.y);
  }

  private addInvisibleObjectsArea(): GameObj {
    return this.kaplay.add([
      this.kaplay.anchor('center'),
      this.kaplay.rect(100, 100, { fill: false }),
      this.kaplay.layer('game'),
      this.kaplay.pos(this.player.position),
    ]);
  }

  private createScenes(): void {
    this.createScene(SceneTag.Overworld, {
      doors: overworldDoors,
      boundaries: overworldBoundariesMatrix
    });

    this.createScene(SceneTag.BlockA, { doors: blockADoors });
    this.createScene(SceneTag.BlockB, {});
    this.createScene(SceneTag.BlockC, {});
    this.createScene(SceneTag.WestForest, {});
    this.createScene(SceneTag.EastForest, {});
  }

  private createScene(tag: SceneTag, config: { doors?: DoorConfig, boundaries?: number[][] }): void {
    this.kaplay.scene(tag, (options) => {
      this.player.destroy();

      this.kaplay.setBackground(this.kaplay.color(0, 0, 0).color);

      this.kaplay.loadSprite('background', `src/assets/maps/${tag}/background.png`);
      this.kaplay.loadSprite('foreground', `src/assets/maps/${tag}/foreground.png`);

      this.kaplay.add([this.kaplay.sprite("background"), this.kaplay.pos(0, 0), this.kaplay.scale(this.scale), this.kaplay.layer('background')]);
      this.kaplay.add([this.kaplay.sprite("foreground"), this.kaplay.pos(0, 0), this.kaplay.scale(this.scale), this.kaplay.layer('foreground')]);

      this.player.load();
      this.player.setPosition(options.playerPosition);

      const invisibleObjectsArea = this.addInvisibleObjectsArea();
      const doors: DoorObject[] = [];
      const boundaries: GameObj[] = [];
      const characters: GameObj[] = [];

      if (config.doors) {
        this.createDoors(config.doors, doors);
      }

      if (config.boundaries) {
        this.createBoundaries(config.boundaries, boundaries);
      }

      this.kaplay.on('move', 'player', () => {
        this.updateInvisibleObjectsArea(invisibleObjectsArea);

        this.updateInvisibleObjects(doors, invisibleObjectsArea);
        this.updateInvisibleObjects(boundaries, invisibleObjectsArea);
      });

      this.player.onCollide('door', (door) => {
        if (door.to && door.to !== this.currentScene) {
          this.currentScene = door.to;

          this.kaplay.go(door.to, { playerPosition: door.position });
        }
      });
    });
  }

  private createDoors(doors: DoorConfig, doorPoints: DoorObject[]): void {
    const matrix = doors!.matrix;
    const tags = Object.values(SceneTag);

    matrix.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (tags.includes(col)) {
          doorPoints.push(this.createDoorPoint(col, colIndex, rowIndex, doors.newPlayerPosition[col]));
        }
      });
    });
  }

  private createBoundaries(matrix: number[][], boundaries: GameObj[]): void {
    matrix.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col === 1) {
          boundaries.push(this.kaplay.make([
            this.kaplay.rect(16 * this.scale, 16 * this.scale, { fill: false }),
            this.kaplay.area(),
            this.kaplay.body({ isStatic: true }),
            this.kaplay.layer('game'),
            this.kaplay.pos(colIndex * 16 * this.scale, rowIndex * 16 * this.scale),
          ]));
        }
      });
    });
  }

  private createDoorPoint(to: SceneTag, colIndex: number, rowIndex: number, newPlayerPosition: { x: number, y: number }): DoorObject {
    return this.kaplay.make([
      this.kaplay.rect(16 * this.scale, 16 * this.scale, { fill: false }),
      this.kaplay.area(),
      this.kaplay.body({ isStatic: true }),
      this.kaplay.layer('game'),
      this.kaplay.pos(colIndex * 16 * this.scale, rowIndex * 16 * this.scale),
      {
        to,
        position: this.kaplay.vec2(newPlayerPosition.x, newPlayerPosition.y),
      } as DoorObj,
      'door'
    ]);
  }

  private updateInvisibleObjects(objects: DoorObject[] | GameObj[], area: GameObj): void {
    objects.forEach((object) => {
      if (!object.exists() && this.objectIsInsideRenderArea(object.pos, area)) {
        this.kaplay.add(object);
      } else if (object.exists() && !this.objectIsInsideRenderArea(object.pos, area)) {
        this.kaplay.destroy(object);
      }
    });
  }

}
