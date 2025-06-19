import { gamePlayConfig } from "../../config";
import { gameRuntimeData } from "../../gameRuntimeData";
import GamePlay from "../../scenes/GamePlay";
import Bullet from "../bullet/bullet";

export default class MapUnit {
  unit!: Phaser.Physics.Arcade.Image;
  cannon: Phaser.GameObjects.Image | undefined;

  bullet!: Bullet;

  constructor(
    public scene: GamePlay,
    public x: number,
    public y: number,
    public color: number,
    public country: string
  ) {
    this.unit = scene.unitGroup.create(
      x + gamePlayConfig.unitWidth / 2,
      y + gamePlayConfig.unitWidth / 2,
      "rect"
    ) as Phaser.Physics.Arcade.Image;

    this.unit.setImmovable(true);

    this.unit.setDisplaySize(
      gamePlayConfig.unitWidth,
      gamePlayConfig.unitWidth
    );
    this.unit.setSize(gamePlayConfig.unitWidth, gamePlayConfig.unitWidth);
    this.unit.setTint(color);

    // ✅ Attach reference to self
    this.unit.setData("mapUnit", this);
  }

  addCannon() {
    this.cannon = this.scene.add.image(this.unit.x, this.unit.y, "cannon");

    this.cannon.setDisplaySize(
      gamePlayConfig.unitWidth - 20,
      gamePlayConfig.unitWidth - 20
    );

    this.scene.tweens.add({
      targets: this.cannon,
      angle: 360,
      duration: 4000, // 4 seconds per full rotation (adjust as needed)
      repeat: -1, // infinite loop
      ease: "Linear", // constant speed
    });
  }

  shoot() {
    if (!this.cannon) return;
    const angle = this.cannon.rotation;
    const xOffset = 12;
    const yOffset = -4;

    const rotatedX = Math.cos(angle) * xOffset - Math.sin(angle) * yOffset;
    const rotatedY = Math.sin(angle) * xOffset + Math.cos(angle) * yOffset;

    const bulletX = this.cannon!.x + rotatedX;
    const bulletY = this.cannon!.y + rotatedY;

    this.bullet = new Bullet(
      this.scene,
      bulletX,
      bulletY,
      angle,
      this.country,
      this.color
    );
    gameRuntimeData.bullets.push(this.bullet);
  }

  changeCountry(newCountry: string, newCollor: number) {
    if (this.cannon) {
      this.cannon.destroy();
      this.cannon = undefined;
    }

    this.country = newCountry;
    this.color = newCollor;
    this.unit.setTint(newCollor);

    this.unit.setData("mapUnit", this);
  }
}
