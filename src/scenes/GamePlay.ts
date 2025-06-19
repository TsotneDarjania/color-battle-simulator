// Responsive camera zoom adjustment for different screen sizes
import Phaser from "phaser";
import { GameMap } from "../components/gameMap/map";
import CanvasScene from "./CanvasScene";
import { GameManager } from "../core/GameManager";
import { gamePlayConfig } from "../config";
import { mapSize } from "../mapData";

export default class GamePlay extends Phaser.Scene {
  unitGroup!: Phaser.Physics.Arcade.StaticGroup;

  gameMap!: GameMap;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  canvasScene!: CanvasScene;
  gameManager!: GameManager;

  cameraTarget = {
    x: 0,
    y: 0,
    zoom: 1,
  };

  constructor() {
    super("GamePlay");
  }

  create() {
    this.unitGroup = this.physics.add.staticGroup();

    this.adjustCameraZoomToFitMap();
    this.addGameMap();
    this.setupCameraControls();
    this.runCanvasScene();
    this.createGameManager();
  }

  adjustCameraZoomToFitMap() {
    const cam = this.cameras.main;
    const unitSize = gamePlayConfig.unitWidth;
    const mapPixelSize = mapSize * unitSize;

    const zoomX = cam.width / mapPixelSize;
    const zoomY = cam.height / mapPixelSize;
    const targetZoom = Math.min(zoomX, zoomY);

    this.cameraTarget.zoom = Phaser.Math.Clamp(targetZoom, 0.4, 1);
    cam.setZoom(this.cameraTarget.zoom);
  }

  createGameManager() {
    this.gameManager = new GameManager(this, this.canvasScene);
  }

  runCanvasScene() {
    this.scene.launch("CanvasScene");
    this.canvasScene = this.scene.get("CanvasScene") as CanvasScene;
  }

  addGameMap() {
    this.gameMap = new GameMap(this);

    const cam = this.cameras.main;
    const unitSize = gamePlayConfig.unitWidth;
    const mapPixelSize = unitSize * mapSize;

    const mapCenterX = mapPixelSize / 2;
    const mapCenterY = mapPixelSize / 2;

    const screenCenterX = cam.width / 2;
    const screenCenterY = cam.height / 2;

    this.cameraTarget.x = mapCenterX - screenCenterX / cam.zoom;
    this.cameraTarget.y = mapCenterY - screenCenterY / cam.zoom;

    cam.scrollX = this.cameraTarget.x;
    cam.scrollY = this.cameraTarget.y;
  }

  setupCameraControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      Q: Phaser.Input.Keyboard.KeyCodes.Q,
      E: Phaser.Input.Keyboard.KeyCodes.E,
    }) as any;

    const cam = this.cameras.main;
    this.cameraTarget.x = cam.scrollX;
    this.cameraTarget.y = cam.scrollY;
    this.cameraTarget.zoom = cam.zoom;

    this.input.on("wheel", (_: any, __: number, deltaY: number) => {
      const zoomChange = deltaY > 0 ? -0.1 : 0.1;
      this.cameraTarget.zoom = Phaser.Math.Clamp(
        this.cameraTarget.zoom + zoomChange,
        0.2,
        3
      );
    });
  }

  update() {
    this.handleCameraMovement();

    const cam = this.cameras.main;
    cam.scrollX = Phaser.Math.Linear(cam.scrollX, this.cameraTarget.x, 0.1);
    cam.scrollY = Phaser.Math.Linear(cam.scrollY, this.cameraTarget.y, 0.1);
    cam.zoom = Phaser.Math.Linear(cam.zoom, this.cameraTarget.zoom, 0.1);

    const cameraBounds = Phaser.Geom.Rectangle.Clone(
      this.cameras.main.worldView
    );
    Phaser.Geom.Rectangle.Inflate(cameraBounds, 100, 100);

    this.unitGroup.children.each((unit: Phaser.GameObjects.GameObject) => {
      const sprite = unit as Phaser.Physics.Arcade.Image;
      const visible = cameraBounds.contains(sprite.x, sprite.y);
      sprite.setVisible(visible);
    }, this);
  }

  handleCameraMovement() {
    const moveSpeed = 20;

    if (this.cursors.left?.isDown || this.wasdKeys.A.isDown)
      this.cameraTarget.x -= moveSpeed;
    if (this.cursors.right?.isDown || this.wasdKeys.D.isDown)
      this.cameraTarget.x += moveSpeed;
    if (this.cursors.up?.isDown || this.wasdKeys.W.isDown)
      this.cameraTarget.y -= moveSpeed;
    if (this.cursors.down?.isDown || this.wasdKeys.S.isDown)
      this.cameraTarget.y += moveSpeed;

    if (this.wasdKeys.Q.isDown)
      this.cameraTarget.zoom = Phaser.Math.Clamp(
        this.cameraTarget.zoom - 0.01,
        0.2,
        3
      );
    if (this.wasdKeys.E.isDown)
      this.cameraTarget.zoom = Phaser.Math.Clamp(
        this.cameraTarget.zoom + 0.01,
        0.2,
        3
      );
  }
}
