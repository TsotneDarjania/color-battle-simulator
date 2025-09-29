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
    public country: string,
    public bulletColor: number
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

    // ✅ Draw rectangle border around the unit
    const border = this.scene.add.graphics();
    border.lineStyle(0.5, 0x000000, 1); // white border, thickness 2

    const halfWidth = gamePlayConfig.unitWidth / 2;

    border.strokeRect(
      this.unit.x - halfWidth,
      this.unit.y - halfWidth,
      gamePlayConfig.unitWidth,
      gamePlayConfig.unitWidth
    );

    border.setDepth(1); // make sure it's above the unit
    this.unit.setData("border", border); // store border for potential cleanup
  }

  addCannon() {
    this.cannon = this.scene.add.image(this.unit.x, this.unit.y, "cannon");
    this.cannon.setTint(0xff4f00);

    this.cannon.setDisplaySize(
      gamePlayConfig.unitWidth - 12,
      gamePlayConfig.unitWidth - 12
    );

    this.scene.tweens.add({
      targets: this.cannon,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: "Linear",
    });
  }

  shoot() {
    if (!this.cannon) return;

    const angle = this.cannon.rotation;
    const xOffset = 6;
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
      this.color,
      this.bulletColor
    );
    gameRuntimeData.bullets.push(this.bullet);
  }

  changeCountry(newCountry: string, newColor: number, newBulletColor: number) {
    if (this.cannon) {
      this.cannon.destroy();
      this.cannon = undefined;
    }

    // Remove previous border
    const oldBorder = this.unit.getData("border");
    if (oldBorder) oldBorder.destroy();

    this.country = newCountry;
    this.color = newColor;
    this.bulletColor = newBulletColor;
    this.unit.setTint(newColor);
    this.unit.setData("mapUnit", this);

    // Re-add the new border
    const border = this.scene.add.graphics();
    border.lineStyle(0.5, 0x000000, 1);

    const halfWidth = gamePlayConfig.unitWidth / 2;

    border.strokeRect(
      this.unit.x - halfWidth,
      this.unit.y - halfWidth,
      gamePlayConfig.unitWidth,
      gamePlayConfig.unitWidth
    );

    border.setDepth(1000);
    this.unit.setData("border", border);
  }
}
