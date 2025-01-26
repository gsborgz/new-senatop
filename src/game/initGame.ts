import kaplayInit, { AnchorComp, AreaComp, BodyComp, GameObj, KAPLAYCtx, LayerComp, PosComp, Rect, ScaleComp, SpriteComp, Vec2 } from 'kaplay';
import matrix from '../assets/maps/overworld/elements/collision';

type Player = {
  speed: number;
  movementDirection: Vec2;
  animationDirection: Direction;
  state: PlayerState;
  walkSpeed: number;
  runSpeed: number;
}

type PlayerObject = GameObj<SpriteComp | PosComp | ScaleComp | LayerComp | AreaComp | BodyComp | AnchorComp | Player>;

enum PlayerState {
  Idle,
  Walking,
  Running,
}

enum Direction {
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

export default function initGame(): void {
  const kaplay = createKaplayInstance();

  kaplay.setLayers(['background', 'game', 'foreground'], 'game');

  loadSprites(kaplay);

  const [player] = addElements(kaplay);

  player.onUpdate(() => {
    player.movementDirection.x = 0;
    player.movementDirection.y = 0;

    setPlayerState(kaplay, player);
    setPlayerAnimation(player);
    setPlayerMovement(player);

    kaplay.setCamPos(player.pos);
  });
}

function createKaplayInstance(): KAPLAYCtx<{}, never> {
  return kaplayInit({
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

function loadSprites(kaplay: KAPLAYCtx<{}, never>): void {
  kaplay.loadSprite("background", "src/assets/maps/overworld/background.png");
  kaplay.loadSprite("foreground", "src/assets/maps/overworld/foreground.png");
  kaplay.loadSprite("player", "src/assets/characters/player.png", {
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
}

function addElements(kaplay: KAPLAYCtx<{}, never>): [PlayerObject] {
  const scale = 2.5;
  const player = addPlayer(kaplay, scale);

  kaplay.add([kaplay.sprite("background"), kaplay.pos(0, 0), kaplay.scale(scale), kaplay.layer('background')]);
  kaplay.add([kaplay.sprite("foreground"), kaplay.pos(0, 0), kaplay.scale(scale), kaplay.layer('foreground')]);

  // addCollisionPoints(kaplay, scale);

  return [player];
}

function addCollisionPoints(kaplay: KAPLAYCtx<{}, never>, scale: number): void {
  const collisionPoints = matrix.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === 1) {
        kaplay.add([
          kaplay.rect(16 * scale, 16 * scale, { fill: false }),
          kaplay.pos(colIndex * 16 * scale, rowIndex * 16 * scale),
          kaplay.area(),
          kaplay.body({ isStatic: true }),
          kaplay.layer('game'),
          "boundary"
        ]);
      }
    });
  });
}

function addPlayer(kaplay: KAPLAYCtx<{}, never>, scale: number): PlayerObject {
  return kaplay.add([
    kaplay.sprite("player", { anim: 'downIdle' }),
    kaplay.pos(1600, 1990),
    kaplay.scale(scale),
    kaplay.area(),
    kaplay.body(),
    kaplay.anchor('center'),
    "player",
    {
      speed: 0,
      walkSpeed: 150,
      runSpeed: 300,
      movementDirection: kaplay.vec2(0, 0),
      animationDirection: Direction.Down,
      state: PlayerState.Idle
    } as Player,
    kaplay.layer('game')
  ]);
}

function setPlayerState(kaplay: KAPLAYCtx<{}, never>, player: PlayerObject): void {
  const movingRight = kaplay.isKeyDown('right');
  const movingLeft = kaplay.isKeyDown('left');
  const movingDown = kaplay.isKeyDown('down');
  const movingUp = kaplay.isKeyDown('up');
  const isRunning = kaplay.isKeyDown('shift');

  if (movingRight) {
    player.movementDirection.x = 1;
    player.movementDirection.y = 0;
    player.animationDirection = Direction.Right;
  } else if (movingLeft) {
    player.movementDirection.x = -1;
    player.movementDirection.y = 0;
    player.animationDirection = Direction.Left;
  } else if (movingDown) {
    player.movementDirection.y = 1;
    player.movementDirection.x = 0;
    player.animationDirection = Direction.Down;
  } else if (movingUp) {
    player.movementDirection.y = -1;
    player.movementDirection.x = 0;
    player.animationDirection = Direction.Up;
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
  } else {
    player.state = PlayerState.Idle;
    player.speed = 0;
    player.animSpeed = 0.1;
  }
}

function setPlayerAnimation(player: PlayerObject): void {
  const playerAnimation = {
    [PlayerState.Idle]: () => setPlayerIdleAnimation(player),
    [PlayerState.Walking]: () => setPlayerWalkingAnimation(player),
    [PlayerState.Running]: () => setPlayerRunningAnimation(player)
  }

  playerAnimation[player.state]();
}

function setPlayerIdleAnimation(player: PlayerObject): void {
  const currentAnim = player.getCurAnim()?.name;

  if (player.animationDirection === Direction.Right && currentAnim !== PlayerAnimation.RightIdle) {
    player.play(PlayerAnimation.RightIdle);
  } else if (player.animationDirection === Direction.Left && currentAnim !== PlayerAnimation.LeftIdle) {
    player.play(PlayerAnimation.LeftIdle);
  } else if (player.animationDirection === Direction.Down && currentAnim !== PlayerAnimation.DownIdle) {
    player.play(PlayerAnimation.DownIdle);
  } else if (player.animationDirection === Direction.Up && currentAnim !== PlayerAnimation.UpIdle) {
    player.play(PlayerAnimation.UpIdle);
  }
}

function setPlayerWalkingAnimation(player: PlayerObject): void {
  const currentAnim = player.getCurAnim()?.name;

  if (player.animationDirection === Direction.Right && currentAnim !== PlayerAnimation.RightWalk) {
    player.play(PlayerAnimation.RightWalk);
  } else if (player.animationDirection === Direction.Left && currentAnim !== PlayerAnimation.LeftWalk) {
    player.play(PlayerAnimation.LeftWalk);
  } else if (player.animationDirection === Direction.Down && currentAnim !== PlayerAnimation.DownWalk) {
    player.play(PlayerAnimation.DownWalk);
  } else if (player.animationDirection === Direction.Up && currentAnim !== PlayerAnimation.UpWalk) {
    player.play(PlayerAnimation.UpWalk);
  }
}

function setPlayerRunningAnimation(player: PlayerObject): void {
  const currentAnim = player.getCurAnim()?.name;

  if (player.animationDirection === Direction.Right && currentAnim !== PlayerAnimation.RightRun) {
    player.play(PlayerAnimation.RightRun);
  } else if (player.animationDirection === Direction.Left && currentAnim !== PlayerAnimation.LeftRun) {
    player.play(PlayerAnimation.LeftRun);
  } else if (player.animationDirection === Direction.Down && currentAnim !== PlayerAnimation.DownRun) {
    player.play(PlayerAnimation.DownRun);
  } else if (player.animationDirection === Direction.Up && currentAnim !== PlayerAnimation.UpRun) {
    player.play(PlayerAnimation.UpRun);
  }
}

function setPlayerMovement(player: PlayerObject): void {
  player.move(player.movementDirection.scale(player.speed));
}
