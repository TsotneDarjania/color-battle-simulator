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
    this.load.image("border", "img/border.png");


    this.load.image("empty", "img/empty.png");
    this.load.image("shoot", "img/shoot.png");
    this.load.image("new-cannon", "img/new-cannon.png");
    this.load.image("multiple-bullet", "img/multiple-bullet.png");
    this.load.image("x2", "img/x2.png"); 


    this.load.image("arrow", "img/arrow.png");

    this.load.image("tower", "img/tower.png");

    //Flags
    this.load.image("brazil", "flags/brazil.png");
    this.load.image("germany", "flags/germany.png");
    this.load.image("spain", "flags/spain.png");
    this.load.image("italy", "flags/italy.png");

    this.load.image("bmw", "logos/BMW.png");
    this.load.image("ford", "logos/Ford.png");
    this.load.image("mercedes", "logos/Mercedes.png");
    this.load.image("toyota", "logos/Toyota.png");
  }

  create() {
    this.scene.start("GamePlay");
  }
}
