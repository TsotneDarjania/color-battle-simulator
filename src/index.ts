import Phaser from "phaser";
import config from "./config";
import Preload from "./scenes/Preload";
import GamePlay from "./scenes/GamePlay";
import CanvasScene from "./scenes/CanvasScene";

new Phaser.Game(
  Object.assign(config, {
    scene: [Preload, GamePlay, CanvasScene],
  })
);
