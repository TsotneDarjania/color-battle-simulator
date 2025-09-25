import { gamePlayConfig } from "../../config";
import { gameRuntimeData } from "../../gameRuntimeData";
import GamePlay from "../../scenes/GamePlay";
import Bullet from "../bullet/bullet";

export default class Tower {
  unit!: Phaser.Physics.Arcade.Image;
  cannon: Phaser.GameObjects.Image | undefined;
  bullet!: Bullet;

  isMainCannon = false;

  health = 0;
  healthText!: Phaser.GameObjects.Text;

  isTower = true;

  constructor(
    public scene: GamePlay,
    public x: number,
    public y: number,
    public color: number,
    public country: string,
    public bulletColor: number
  ) {
    this.unit = scene.unitGroup.create(
      x + gamePlayConfig.unitWidth,
      y + gamePlayConfig.unitWidth,
      "rect"
    ) as Phaser.Physics.Arcade.Image;

    this.unit.setImmovable(true);
    this.unit.setDisplaySize(
      gamePlayConfig.unitWidth * 2,
      gamePlayConfig.unitWidth * 2
    );
    this.unit.setSize(
      gamePlayConfig.unitWidth * 2,
      gamePlayConfig.unitWidth * 2
    );
    this.unit.setTint(color);

    // ✅ Attach reference to self
    this.unit.setData("mapUnit", this);

    // ✅ Draw rectangle border around the unit
    const border = this.scene.add.graphics();
    border.lineStyle(2, 0x000000, 1); // white border, thickness 2

    const halfWidth = this.unit.getBounds().width / 2;

    border.strokeRect(
      this.unit.getBounds().centerX - halfWidth,
      this.unit.getBounds().centerY - halfWidth,
      gamePlayConfig.unitWidth * 2,
      gamePlayConfig.unitWidth * 2
    );

    border.setDepth(1); // make sure it's above the unit
    this.unit.setData("border", border); // store border for potential cleanup

    this.addTower();
    this.addLeathText();
  }

  addLeathText() {
    this.healthText = this.scene.add
      .text(
        this.x + this.unit.getBounds().width / 2 - 1,
        this.y,
        this.health.toString(),
        {
          fontFamily: "Arial",
          fontSize: "36px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 6,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: "#000000",
            blur: 4,
            fill: true,
          },
        }
      )
      .setOrigin(0.5)
      .setDepth(11);
  }

  addTower() {
    const towerImage = this.scene.add.image(this.unit.x, this.unit.y, "tower");
    towerImage.setScale(0.7);
    towerImage.setDepth(1);

    const darkerColor = this.darkenColor(this.color, 0.4);
    towerImage.setTint(darkerColor);
  }

  addCannon(isMain: boolean) {
    if (isMain) {
      this.isMainCannon = true;
    }
    this.cannon = this.scene.add.image(this.unit.x, this.unit.y, "cannon");
    this.cannon.alpha = 0;

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

  addHealth() {
    this.health++;
    this.healthText.setText(this.health.toString());
  }

  changeCountry(newCountry: string, newColor: number, newBulletColor: number) {
    if (this.health > 1) {
      this.health--;
      this.healthText.setText(this.health.toString());
      return;
    }

    this.healthText.destroy()

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
    border.lineStyle(2, 0x000000, 1);

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

  darkenColor(color: number, factor = 0.8) {
    // Extract RGB
    let r = (color >> 16) & 0xff;
    let g = (color >> 8) & 0xff;
    let b = color & 0xff;

    // Darken each channel
    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);

    // Recombine into hex
    return (r << 16) | (g << 8) | b;
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
}
