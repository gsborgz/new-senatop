import { AnchorComp, AreaComp, BodyComp, GameObj, KAPLAYCtx, LayerComp, PosComp, ScaleComp, SpriteComp, Vec2 } from "kaplay";
import { DoorObj, SceneTag } from "./Scene";

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

export class Player {
  private properties!: PlayerObject;

  constructor(
    private readonly kaplay: KAPLAYCtx<{}, never>,
    private readonly scale: number,
  ) { }

  public load() {
    this.properties = this.addPlayer();

    this.properties.onUpdate(() => {
      this.properties.movementDirection.x = 0;
      this.properties.movementDirection.y = 0;

      this.setPlayerState();
      this.setPlayerAnimation();
      this.setPlayerMovement();

      this.kaplay.setCamPos(this.properties.pos);
    });
  }

  public setPosition(position: Vec2): void {
    this.properties.pos = this.kaplay.vec2(position);
  }

  public onCollide(tag: string, callback: (obj: GameObj) => void): void {
    this.properties.onCollide(tag, (obj) => {
      callback(obj as GameObj);
    });
  }

  private addPlayer(): PlayerObject {
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

    return this.kaplay.add([
      this.kaplay.sprite("player", { anim: 'downIdle' }),
      this.kaplay.pos(0, 0),
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
  }

  private setPlayerState(): void {
    const movingRight = this.kaplay.isKeyDown('right');
    const movingLeft = this.kaplay.isKeyDown('left');
    const movingDown = this.kaplay.isKeyDown('down');
    const movingUp = this.kaplay.isKeyDown('up');
    const isRunning = this.kaplay.isKeyDown('shift');

    if (movingRight) {
      this.properties.movementDirection.x = 1;
      this.properties.movementDirection.y = 0;
      this.properties.animationDirection = PlayerDirection.Right;
    } else if (movingLeft) {
      this.properties.movementDirection.x = -1;
      this.properties.movementDirection.y = 0;
      this.properties.animationDirection = PlayerDirection.Left;
    } else if (movingDown) {
      this.properties.movementDirection.y = 1;
      this.properties.movementDirection.x = 0;
      this.properties.animationDirection = PlayerDirection.Down;
    } else if (movingUp) {
      this.properties.movementDirection.y = -1;
      this.properties.movementDirection.x = 0;
      this.properties.animationDirection = PlayerDirection.Up;
    }

    if (this.kaplay.isKeyDown('e')) {
      console.log(this.properties.pos);
    }

    if (movingRight || movingLeft || movingDown || movingUp) {
      if (isRunning) {
        this.properties.state = PlayerState.Running;
        this.properties.speed = this.properties.runSpeed;
        this.properties.animSpeed = 1;
      } else {
        this.properties.state = PlayerState.Walking;
        this.properties.speed = this.properties.walkSpeed;
        this.properties.animSpeed = 0.6;
      }
    } else {
      this.properties.state = PlayerState.Idle;
      this.properties.speed = 0;
      this.properties.animSpeed = 0.1;
    }
  }

  private setPlayerAnimation(): void {
    const playerAnimation = {
      [PlayerState.Idle]: () => this.setPlayerIdleAnimation(),
      [PlayerState.Walking]: () => this.setPlayerWalkingAnimation(),
      [PlayerState.Running]: () => this.setPlayerRunningAnimation()
    }

    playerAnimation[this.properties.state]();
  }

  private setPlayerIdleAnimation(): void {
    const currentAnim = this.properties.getCurAnim()?.name;

    if (this.properties.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightIdle) {
      this.properties.play(PlayerAnimation.RightIdle);
    } else if (this.properties.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftIdle) {
      this.properties.play(PlayerAnimation.LeftIdle);
    } else if (this.properties.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownIdle) {
      this.properties.play(PlayerAnimation.DownIdle);
    } else if (this.properties.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpIdle) {
      this.properties.play(PlayerAnimation.UpIdle);
    }
  }

  private setPlayerWalkingAnimation(): void {
    const currentAnim = this.properties.getCurAnim()?.name;

    if (this.properties.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightWalk) {
      this.properties.play(PlayerAnimation.RightWalk);
    } else if (this.properties.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftWalk) {
      this.properties.play(PlayerAnimation.LeftWalk);
    } else if (this.properties.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownWalk) {
      this.properties.play(PlayerAnimation.DownWalk);
    } else if (this.properties.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpWalk) {
      this.properties.play(PlayerAnimation.UpWalk);
    }
  }

  private setPlayerRunningAnimation(): void {
    const currentAnim = this.properties.getCurAnim()?.name;

    if (this.properties.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightRun) {
      this.properties.play(PlayerAnimation.RightRun);
    } else if (this.properties.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftRun) {
      this.properties.play(PlayerAnimation.LeftRun);
    } else if (this.properties.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownRun) {
      this.properties.play(PlayerAnimation.DownRun);
    } else if (this.properties.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpRun) {
      this.properties.play(PlayerAnimation.UpRun);
    }
  }

  private setPlayerMovement(): void {
    this.properties.move(this.properties.movementDirection.scale(this.properties.speed));
  }
}
