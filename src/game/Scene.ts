import { AreaComp, BodyComp, Color, GameObj, KAPLAYCtx, LayerComp, PosComp, RectComp, ScaleComp, SpriteComp, Vec2 } from 'kaplay';

type Scenario = GameObj<SpriteComp | PosComp | ScaleComp | LayerComp>;

export type DoorConfig = {
  matrix: number[][];
  positions: Record<number, { x: number, y: number }>;
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

export type SceneProperties = {
  tag: SceneTag;
  scale: number;
  doors?: DoorConfig;
  collision?: [number[]];
  characters?: [number[]];
}

export class Scene {
  public tag: string;
  private background!: Scenario;
  private foreground!: Scenario;
  private doorPoints: DoorObject[];

  constructor(
    private readonly kaplay: KAPLAYCtx<{}, never>,
    private readonly properties: SceneProperties
  ) {
    this.tag = this.properties.tag;
    this.doorPoints = [];
  }

  public load(): void {
    this.kaplay.setBackground(this.kaplay.color(0, 0, 0).color);

    this.kaplay.loadSprite('background', `src/assets/maps/${this.tag}/background.png`);
    this.kaplay.loadSprite('foreground', `src/assets/maps/${this.tag}/foreground.png`);

    this.background = this.kaplay.add([this.kaplay.sprite("background"), this.kaplay.pos(0, 0), this.kaplay.scale(this.properties.scale), this.kaplay.layer('background')]);
    this.foreground = this.kaplay.add([this.kaplay.sprite("foreground"), this.kaplay.pos(0, 0), this.kaplay.scale(this.properties.scale), this.kaplay.layer('foreground')]);

    if (this.properties.doors) {
      this.addDoorPoints();
    }
  }

  public unload(): void {
    this.kaplay.destroy(this.background!);
    this.kaplay.destroy(this.foreground!);

    this.destroyDoorPoints();
  }

  private async addDoorPoints(): Promise<void> {
    const matrix = this.properties.doors!.matrix;

    matrix.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        const position = this.properties.doors!.positions[col];

        switch (col) {
          case DoorCode.Overworld:

            this.doorPoints.push(this.kaplay.add([
              this.kaplay.rect(16 * this.properties.scale, 16 * this.properties.scale, { fill: true }),
              this.kaplay.area(),
              this.kaplay.body({ isStatic: true }),
              this.kaplay.layer('game'),
              this.kaplay.pos(colIndex * 16 * this.properties.scale, rowIndex * 16 * this.properties.scale),
              {
                to: SceneTag.Overworld,
                position: this.kaplay.vec2(position.x, position.y),
              } as DoorObj,
              'door'
            ]));

            break;
          case DoorCode.BlockA:
            this.doorPoints.push(this.kaplay.add([
              this.kaplay.rect(16 * this.properties.scale, 16 * this.properties.scale, { fill: true }),
              this.kaplay.area(),
              this.kaplay.body({ isStatic: true }),
              this.kaplay.layer('game'),
              this.kaplay.pos(colIndex * 16 * this.properties.scale, rowIndex * 16 * this.properties.scale),
              {
                to: SceneTag.BlockA,
                position: this.kaplay.vec2(position.x, position.y),
              } as DoorObj,
              'door'
            ]));

            break;
          case DoorCode.BlockB:
            this.doorPoints.push(this.kaplay.add([
              this.kaplay.rect(16 * this.properties.scale, 16 * this.properties.scale, { fill: true }),
              this.kaplay.area(),
              this.kaplay.body({ isStatic: true }),
              this.kaplay.layer('game'),
              this.kaplay.pos(colIndex * 16 * this.properties.scale, rowIndex * 16 * this.properties.scale),
              {
                to: SceneTag.BlockB,
                position: this.kaplay.vec2(position.x, position.y),
              } as DoorObj,
              'door'
            ]));

            break;
          case DoorCode.BlockC:
            this.doorPoints.push(this.kaplay.add([
              this.kaplay.rect(16 * this.properties.scale, 16 * this.properties.scale, { fill: true }),
              this.kaplay.area(),
              this.kaplay.body({ isStatic: true }),
              this.kaplay.layer('game'),
              this.kaplay.pos(colIndex * 16 * this.properties.scale, rowIndex * 16 * this.properties.scale),
              {
                to: SceneTag.BlockC,
                position: this.kaplay.vec2(position.x, position.y),
              } as DoorObj,
              'door'
            ]));

            break;
          case DoorCode.WestForest:
            this.doorPoints.push(this.kaplay.add([
              this.kaplay.rect(16 * this.properties.scale, 16 * this.properties.scale, { fill: true }),
              this.kaplay.area(),
              this.kaplay.body({ isStatic: true }),
              this.kaplay.layer('game'),
              this.kaplay.pos(colIndex * 16 * this.properties.scale, rowIndex * 16 * this.properties.scale),
              {
                to: SceneTag.WestForest,
                position: this.kaplay.vec2(position.x, position.y),
              } as DoorObj,
              'door'
            ]));

            break;
          case DoorCode.EastForest:
            this.doorPoints.push(this.kaplay.add([
              this.kaplay.rect(16 * this.properties.scale, 16 * this.properties.scale, { fill: true }),
              this.kaplay.area(),
              this.kaplay.body({ isStatic: true }),
              this.kaplay.layer('game'),
              this.kaplay.pos(colIndex * 16 * this.properties.scale, rowIndex * 16 * this.properties.scale),
              {
                to: SceneTag.EastForest,
                position: this.kaplay.vec2(position.x, position.y),
              } as DoorObj,
              'door'
            ]));

            break;
        }
      });
    });
  }

  private async destroyDoorPoints(): Promise<void> {
    this.doorPoints.forEach((door) => this.kaplay.destroy(door));
  }

}
