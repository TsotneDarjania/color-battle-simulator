import GamePlay from "../../scenes/GamePlay";
import { gamePlayConfig } from "../../config";
import { gameRuntimeData } from "../../gameRuntimeData";
import MapUnit from "../mapUnit/MapUnit";

export default class Bullet extends Phaser.Physics.Arcade.Image {
  constructor(
    public scene: GamePlay,
    x: number,
    y: number,
    angle: number,
    public country: string,
    public countryColor: number
  ) {
    super(scene, x, y, "circle");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setTint(0xff4f00);

    this.setDisplaySize(
      gamePlayConfig.unitWidth - 24,
      gamePlayConfig.unitWidth - 24
    );
    this.setCircle(12);
    this.setBounce(1);

    const speed = 80;
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    this.addColliderDetections();
  }

  addColliderDetections() {
    // Border
    this.scene.physics.add.collider(
      this,
      [...this.scene.gameMap.borders],
      () => {}
    );

    // another Bullet
    // const newLocal = this.scene.physics.add.collider(
    //   this,
    //   [...gameRuntimeData.bullets.map((bullet) => bullet)],
    //   () => {
    //     this.destroy();

    //     const bulletArray = gameRuntimeData.bullets;
    //     const index = bulletArray.indexOf(this);

    //     if (index !== -1) {
    //       bulletArray.splice(index, 1);
    //     }
    //   }
    // );

    //another unit
    this.scene.physics.add.overlap(
      this,
      [...gameRuntimeData.units.map((unit) => unit.unit)],
      (a, b) => {
        const targetUnit = b.getData("mapUnit") as MapUnit;

        if (targetUnit.country === this.country) return;

        targetUnit.changeCountry(this.country, this.countryColor);

        this.destroy();

        const bulletArray = gameRuntimeData.bullets;
        const index = bulletArray.indexOf(this);

        if (index !== -1) {
          bulletArray.splice(index, 1); // remove 1 item at that index
        }
      }
    );
  }
}
