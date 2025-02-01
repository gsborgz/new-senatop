import { AnchorComp, AreaComp, BodyComp, GameObj, KAPLAYCtx, LayerComp, PosComp, RectComp, ScaleComp, SpriteComp, Vec2 } from 'kaplay';
import overworldDoors from '../assets/maps/overworld/elements/doors';
import blockADoors from '../assets/maps/block-a/elements/doors';
import overworldBoundariesMatrix from '../assets/maps/overworld/elements/boundaries';
import eastForestDoors from '../assets/maps/east-forest/elements/doors';
import eastForestBoundariesMatrix from '../assets/maps/east-forest/elements/boundaries';
import westForestDoors from '../assets/maps/west-forest/elements/doors';
import westForestBoundariesMatrix from '../assets/maps/west-forest/elements/boundaries';
import blockABoundariesMatrix from '../assets/maps/block-a/elements/boundaries';
import blockACharactersMatrix from '../assets/maps/block-a/elements/characters';
import overworldCharactersMatrix from '../assets/maps/overworld/elements/characters';
import westForestCharactersMatrix from '../assets/maps/west-forest/elements/characters';
import eastForestCharactersMatrix from '../assets/maps/east-forest/elements/characters';
import blockBDoors from '../assets/maps/block-b/elements/doors';
import blockBBoundariesMatrix from '../assets/maps/block-b/elements/boundaries';
import blockBCharactersMatrix from '../assets/maps/block-b/elements/characters';
import blockCDoors from '../assets/maps/block-c/elements/doors';
import blockCBoundariesMatrix from '../assets/maps/block-c/elements/boundaries';
import blockCCharactersMatrix from '../assets/maps/block-c/elements/characters';

type Scenario = GameObj<SpriteComp | PosComp | ScaleComp | LayerComp>;

export enum CharacterSpriteType {
  TreinerLeft = 'treiner-left',
  TreinerRight = 'treiner-right',
  TreinerUp = 'treiner-up',
  TreinerDown = 'treiner-down',
  TreinerRandom = 'treiner-random',
  Professor = 'professor',
  Elite = 'elite',
}

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

type PlayerObj = {
  speed: number;
  movementDirection: Vec2;
  animationDirection: PlayerDirection;
  state: PlayerState;
  walkSpeed: number;
  runSpeed: number;
}

type PlayerObject = GameObj<SpriteComp | PosComp | ScaleComp | LayerComp | AreaComp | BodyComp | AnchorComp | PlayerObj>;

enum PlayerState {
  Idle,
  Walking,
  Running,
}

enum PlayerDirection {
  Right,
  Left,
  Down,
  Up,
}

enum PlayerAnimation {
  RightIdle = 'rightIdle',
  LeftIdle = 'leftIdle',
  DownIdle = 'downIdle',
  UpIdle = 'upIdle',
  RightWalk = 'rightWalk',
  LeftWalk = 'leftWalk',
  DownWalk = 'downWalk',
  UpWalk = 'upWalk',
  RightRun = 'rightRun',
  LeftRun = 'leftRun',
  DownRun = 'downRun',
  UpRun = 'upRun',
}

export class SceneManager {

  private currentScene: SceneTag = SceneTag.Overworld;

  constructor(
    private readonly kaplay: KAPLAYCtx<{}, never>,
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

  private updateInvisibleObjectsArea(renderArea: GameObj, player: PlayerObject): void {
    renderArea.pos = this.kaplay.vec2(player.pos.x, player.pos.y);
  }

  private addInvisibleObjectsArea(player: PlayerObject): GameObj {
    return this.kaplay.add([
      this.kaplay.anchor('center'),
      this.kaplay.rect(100, 100, { fill: false }),
      this.kaplay.layer('game'),
      this.kaplay.pos(player.pos),
    ]);
  }

  private createScenes(): void {
    this.createScene(SceneTag.Overworld, {
      doors: overworldDoors,
      boundaries: overworldBoundariesMatrix,
      characters: overworldCharactersMatrix
    });

    this.createScene(SceneTag.BlockA, {
      doors: blockADoors,
      boundaries: blockABoundariesMatrix,
      characters: blockACharactersMatrix
    });

    this.createScene(SceneTag.BlockB, {
      doors: blockBDoors,
      boundaries: blockBBoundariesMatrix,
      characters: blockBCharactersMatrix
    });

    this.createScene(SceneTag.BlockC, {
      doors: blockCDoors,
      boundaries: blockCBoundariesMatrix,
      characters: blockCCharactersMatrix
    });

    this.createScene(SceneTag.WestForest, {
      doors: westForestDoors,
      boundaries: westForestBoundariesMatrix,
      characters: westForestCharactersMatrix
    });

    this.createScene(SceneTag.EastForest, {
      doors: eastForestDoors,
      boundaries: eastForestBoundariesMatrix,
      characters: eastForestCharactersMatrix
    });
  }

  private createScene(tag: SceneTag, config: { doors?: DoorConfig, boundaries?: number[][], characters?: CharacterSpriteType[][] }): void {
    this.kaplay.scene(tag, (options) => {
      this.kaplay.setBackground(this.kaplay.color(0, 0, 0).color);

      this.kaplay.loadSprite('background', `src/assets/maps/${tag}/background.png`);
      this.kaplay.loadSprite('foreground', `src/assets/maps/${tag}/foreground.png`);

      this.kaplay.add([this.kaplay.sprite("background"), this.kaplay.pos(0, 0), this.kaplay.scale(this.scale), this.kaplay.layer('background')]);
      this.kaplay.add([this.kaplay.sprite("foreground"), this.kaplay.pos(0, 0), this.kaplay.scale(this.scale), this.kaplay.layer('foreground')]);

      const player = this.addPlayer(options.playerPosition);
      const invisibleObjectsArea = this.addInvisibleObjectsArea(player);
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
        this.updateInvisibleObjectsArea(invisibleObjectsArea, player);

        this.updateInvisibleObjects(doors, invisibleObjectsArea);
        this.updateInvisibleObjects(boundaries, invisibleObjectsArea);
      });
    });
  }
  
  private createDoors(doors: DoorConfig, doorPoints: DoorObject[]): void {
    const matrix = doors!.matrix;
    const tags = Object.values(SceneTag);

    matrix.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (tags.includes(col)) {
          doorPoints.push(this.kaplay.make([
            this.kaplay.rect(16 * this.scale, 16 * this.scale, { fill: false }),
            this.kaplay.area(),
            this.kaplay.body({ isStatic: true }),
            this.kaplay.layer('game'),
            this.kaplay.pos(colIndex * 16 * this.scale, rowIndex * 16 * this.scale),
            {
              to: col,
              position: this.kaplay.vec2(doors.newPlayerPosition[col].x, doors.newPlayerPosition[col].y),
            } as DoorObj,
            'door'
          ]));
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

  private updateInvisibleObjects(objects: DoorObject[] | GameObj[], area: GameObj): void {
    objects.forEach((object) => {
      if (!object.exists() && this.objectIsInsideRenderArea(object.pos, area)) {
        this.kaplay.add(object);
      } else if (object.exists() && !this.objectIsInsideRenderArea(object.pos, area)) {
        this.kaplay.destroy(object);
      }
    });
  }

  private addPlayer(position: Vec2): PlayerObject {
    this.kaplay.loadSprite("player", "src/assets/characters/player.png", {
      sliceY: 12,
      sliceX: 8,
      anims: {
        [PlayerAnimation.RightIdle]: { from: 0, to: 7, loop: true },
        [PlayerAnimation.LeftIdle]: { from: 8, to: 15, loop: true },
        [PlayerAnimation.DownIdle]: { from: 16, to: 23, loop: true },
        [PlayerAnimation.UpIdle]: { from: 24, to: 31, loop: true },
        [PlayerAnimation.RightWalk]: { from: 32, to: 39, loop: true },
        [PlayerAnimation.LeftWalk]: { from: 40, to: 47, loop: true },
        [PlayerAnimation.DownWalk]: { from: 48, to: 55, loop: true },
        [PlayerAnimation.UpWalk]: { from: 56, to: 63, loop: true },
        [PlayerAnimation.RightRun]: { from: 64, to: 71, loop: true },
        [PlayerAnimation.LeftRun]: { from: 72, to: 79, loop: true },
        [PlayerAnimation.DownRun]: { from: 80, to: 87, loop: true },
        [PlayerAnimation.UpRun]: { from: 88, to: 95, loop: true },
      }
    });

    const player = this.kaplay.add([
      this.kaplay.sprite("player", { anim: 'downIdle' }),
      this.kaplay.pos(position),
      this.kaplay.scale(this.scale),
      this.kaplay.area(),
      this.kaplay.body(),
      this.kaplay.anchor('center'),
      "player",
      {
        speed: 0,
        walkSpeed: 150,
        runSpeed: 300,
        movementDirection: this.kaplay.vec2(0, 0),
        animationDirection: PlayerDirection.Down,
        state: PlayerState.Idle
      } as PlayerObj,
      this.kaplay.layer('game')
    ]);

    this.setPlayerListeners(player);

    return player;
  }

  private setPlayerState(player: PlayerObject): void {
    const movingRight = this.kaplay.isKeyDown('right');
    const movingLeft = this.kaplay.isKeyDown('left');
    const movingDown = this.kaplay.isKeyDown('down');
    const movingUp = this.kaplay.isKeyDown('up');
    const isRunning = this.kaplay.isKeyDown('shift');

    if (this.kaplay.isKeyDown('e')) {
      console.log(player.pos);
    }

    if (movingRight) {
      player.movementDirection.x = 1;
      player.movementDirection.y = 0;
      player.animationDirection = PlayerDirection.Right;
    } else if (movingLeft) {
      player.movementDirection.x = -1;
      player.movementDirection.y = 0;
      player.animationDirection = PlayerDirection.Left;
    } else if (movingDown) {
      player.movementDirection.y = 1;
      player.movementDirection.x = 0;
      player.animationDirection = PlayerDirection.Down;
    } else if (movingUp) {
      player.movementDirection.y = -1;
      player.movementDirection.x = 0;
      player.animationDirection = PlayerDirection.Up;
    }

    if (movingRight || movingLeft || movingDown || movingUp) {
      if (isRunning) {
        player.state = PlayerState.Running;
        player.speed = player.runSpeed;
        player.animSpeed = 1;
      } else {
        player.state = PlayerState.Walking;
        player.speed = player.walkSpeed;
        player.animSpeed = 0.6;
      }

      player.trigger('move');
    } else {
      player.state = PlayerState.Idle;
      player.speed = 0;
      player.animSpeed = 0.1;
    }
  }

  private setPlayerAnimation(player: PlayerObject): void {
    const playerAnimation = {
      [PlayerState.Idle]: () => this.setPlayerIdleAnimation(player),
      [PlayerState.Walking]: () => this.setPlayerWalkingAnimation(player),
      [PlayerState.Running]: () => this.setPlayerRunningAnimation(player)
    }

    playerAnimation[player.state]();
  }

  private setPlayerIdleAnimation(player: PlayerObject): void {
    const currentAnim = player.getCurAnim()?.name;

    if (player.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightIdle) {
      player.play(PlayerAnimation.RightIdle);
    } else if (player.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftIdle) {
      player.play(PlayerAnimation.LeftIdle);
    } else if (player.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownIdle) {
      player.play(PlayerAnimation.DownIdle);
    } else if (player.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpIdle) {
      player.play(PlayerAnimation.UpIdle);
    }
  }

  private setPlayerWalkingAnimation(player: PlayerObject): void {
    const currentAnim = player.getCurAnim()?.name;

    if (player.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightWalk) {
      player.play(PlayerAnimation.RightWalk);
    } else if (player.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftWalk) {
      player.play(PlayerAnimation.LeftWalk);
    } else if (player.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownWalk) {
      player.play(PlayerAnimation.DownWalk);
    } else if (player.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpWalk) {
      player.play(PlayerAnimation.UpWalk);
    }
  }

  private setPlayerRunningAnimation(player: PlayerObject): void {
    const currentAnim = player.getCurAnim()?.name;

    if (player.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightRun) {
      player.play(PlayerAnimation.RightRun);
    } else if (player.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftRun) {
      player.play(PlayerAnimation.LeftRun);
    } else if (player.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownRun) {
      player.play(PlayerAnimation.DownRun);
    } else if (player.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpRun) {
      player.play(PlayerAnimation.UpRun);
    }
  }

  private setPlayerMovement(player: PlayerObject): void {
    player.move(player.movementDirection.scale(player.speed));
  }

  private setPlayerListeners(player: PlayerObject): void {
    player.onCollide('door', (door) => {
      if (door.to && door.to !== this.currentScene) {
        this.currentScene = door.to;

        player.destroy();
        this.kaplay.go(door.to, { playerPosition: door.position });
      }
    });

    player.onUpdate(() => {
      player.movementDirection.x = 0;
      player.movementDirection.y = 0;

      this.setPlayerState(player);
      this.setPlayerAnimation(player);
      this.setPlayerMovement(player);

      this.kaplay.setCamPos(player.pos);
    });
  }

}
