import Phaser from "phaser";

export default class Preload extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload() {
    this.load.image("rect", "img/white.png");
    this.load.image("circle", "img/circle.png");
    this.load.image("house", "img/house.png");
    this.load.image("cannon", "img/cannon.png");

    this.load.image("empty", "img/empty.png");
    this.load.image("shoot", "img/shoot.png");
    this.load.image("new-cannon", "img/new-cannon.png");
    this.load.image("multiple-bullet", "img/multiple-bullet.png");
  }

  create() {
    this.scene.start("GamePlay");
  }
}
