import { AnchorComp, AreaComp, BodyComp, GameObj, KAPLAYCtx, LayerComp, PosComp, ScaleComp, SpriteComp, Vec2 } from "kaplay";
import { SceneTag } from "./SceneManager";

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
  private player!: PlayerObject;

  constructor(
    private readonly kaplay: KAPLAYCtx<{}, never>,
    private readonly scale: number,
  ) {
    this.player = this.addPlayer();
  }

  public get position(): Vec2 {
    return this.player.pos;
  }

  public load() {
    console.log('Player loaded');

    this.kaplay.add(this.player);

    this.player.onUpdate(() => {
      this.player.movementDirection.x = 0;
      this.player.movementDirection.y = 0;

      this.setPlayerState();
      this.setPlayerAnimation();
      this.setPlayerMovement();

      this.kaplay.setCamPos(this.player.pos);
    });
  }

  public destroy(): void {
    this.kaplay.destroy(this.player);
  }

  public setPosition(position: Vec2): void {
    this.player.pos = this.kaplay.vec2(position);
  }

  public onCollide(tag: string, callback: (obj: GameObj) => void): void {
    this.player.onCollide(tag, (obj) => {
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

    return this.kaplay.make([
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

    if (this.kaplay.isKeyDown('e')) {
      console.log(this.player.pos);
    }

    if (movingRight) {
      this.player.movementDirection.x = 1;
      this.player.movementDirection.y = 0;
      this.player.animationDirection = PlayerDirection.Right;
    } else if (movingLeft) {
      this.player.movementDirection.x = -1;
      this.player.movementDirection.y = 0;
      this.player.animationDirection = PlayerDirection.Left;
    } else if (movingDown) {
      this.player.movementDirection.y = 1;
      this.player.movementDirection.x = 0;
      this.player.animationDirection = PlayerDirection.Down;
    } else if (movingUp) {
      this.player.movementDirection.y = -1;
      this.player.movementDirection.x = 0;
      this.player.animationDirection = PlayerDirection.Up;
    }

    if (movingRight || movingLeft || movingDown || movingUp) {
      if (isRunning) {
        this.player.state = PlayerState.Running;
        this.player.speed = this.player.runSpeed;
        this.player.animSpeed = 1;
      } else {
        this.player.state = PlayerState.Walking;
        this.player.speed = this.player.walkSpeed;
        this.player.animSpeed = 0.6;
      }

      this.player.trigger('move');
    } else {
      this.player.state = PlayerState.Idle;
      this.player.speed = 0;
      this.player.animSpeed = 0.1;
    }
  }

  private setPlayerAnimation(): void {
    const playerAnimation = {
      [PlayerState.Idle]: () => this.setPlayerIdleAnimation(),
      [PlayerState.Walking]: () => this.setPlayerWalkingAnimation(),
      [PlayerState.Running]: () => this.setPlayerRunningAnimation()
    }

    playerAnimation[this.player.state]();
  }

  private setPlayerIdleAnimation(): void {
    const currentAnim = this.player.getCurAnim()?.name;

    if (this.player.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightIdle) {
      this.player.play(PlayerAnimation.RightIdle);
    } else if (this.player.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftIdle) {
      this.player.play(PlayerAnimation.LeftIdle);
    } else if (this.player.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownIdle) {
      this.player.play(PlayerAnimation.DownIdle);
    } else if (this.player.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpIdle) {
      this.player.play(PlayerAnimation.UpIdle);
    }
  }

  private setPlayerWalkingAnimation(): void {
    const currentAnim = this.player.getCurAnim()?.name;

    if (this.player.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightWalk) {
      this.player.play(PlayerAnimation.RightWalk);
    } else if (this.player.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftWalk) {
      this.player.play(PlayerAnimation.LeftWalk);
    } else if (this.player.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownWalk) {
      this.player.play(PlayerAnimation.DownWalk);
    } else if (this.player.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpWalk) {
      this.player.play(PlayerAnimation.UpWalk);
    }
  }

  private setPlayerRunningAnimation(): void {
    const currentAnim = this.player.getCurAnim()?.name;

    if (this.player.animationDirection === PlayerDirection.Right && currentAnim !== PlayerAnimation.RightRun) {
      this.player.play(PlayerAnimation.RightRun);
    } else if (this.player.animationDirection === PlayerDirection.Left && currentAnim !== PlayerAnimation.LeftRun) {
      this.player.play(PlayerAnimation.LeftRun);
    } else if (this.player.animationDirection === PlayerDirection.Down && currentAnim !== PlayerAnimation.DownRun) {
      this.player.play(PlayerAnimation.DownRun);
    } else if (this.player.animationDirection === PlayerDirection.Up && currentAnim !== PlayerAnimation.UpRun) {
      this.player.play(PlayerAnimation.UpRun);
    }
  }

  private setPlayerMovement(): void {
    this.player.move(this.player.movementDirection.scale(this.player.speed));
  }

}
