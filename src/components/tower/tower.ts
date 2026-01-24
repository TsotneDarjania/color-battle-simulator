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

  towerImage!: Phaser.GameObjects.Image;

  constructor(
    public scene: GamePlay,
    public gridX: number,
    public gridY: number,
    public color: number,
    public country: string,
    public bulletColor: number,
    public tower: { x: number; y: number },
  ) {
    const unitSize = gamePlayConfig.unitWidth;

    // top-left of 2x2 block
    const px = gridX * unitSize;
    const py = gridY * unitSize;

    // center of 2x2 block
    const cx = px + unitSize;
    const cy = py + unitSize;

    // physics body
    this.unit = scene.unitGroup.create(
      cx,
      cy,
      "rect",
    ) as Phaser.Physics.Arcade.Image;

    this.unit.setImmovable(true);
    this.unit.setDisplaySize(unitSize * 2, unitSize * 2);
    this.unit.setSize(unitSize * 2, unitSize * 2);
    (this.unit.body as Phaser.Physics.Arcade.Body).setSize(unitSize * 2, unitSize * 2, true);
this.unit.refreshBody?.();
    this.unit.setOrigin(0.5);
    this.unit.setTint(color);

    // ✅ STORE AIM POINT (THIS IS IMPORTANT)
    (this as any).aimX = cx;
    (this as any).aimY = cy;

    this.unit.setData("mapUnit", this);

    // border
    const border = this.scene.add.graphics();
    border.lineStyle(0.5, 0x000000, 1);
    border.strokeRect(px, py, unitSize * 2, unitSize * 2);
    border.setDepth(1);
    this.unit.setData("border", border);

    this.addTower();
    this.addLeathText();
  }

  addLeathText() {
    this.healthText = this.scene.add
      .text(this.unit.x, this.unit.y - 16, this.health.toString(), {
        fontFamily: "Arial",
        fontSize: "26px",
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
      })
      .setOrigin(0.5)
      .setDepth(11);
  }

  addTower() {
    // this.towerImage = this.scene.add.image(
    //   this.unit.x,
    //   this.unit.y + 10,
    //   "tower",
    // );

    this.towerImage = this.scene.add.image(this.unit.x, this.unit.y, "tower");

    this.towerImage.setScale(0.7);
    this.towerImage.setDepth(1);

    const darkerColor = this.darkenColor(this.color, 0.4);
    this.towerImage.setTint(darkerColor);
  }

  addCannon(isMain: boolean) {
    if (isMain) this.isMainCannon = true;

    this.cannon = this.scene.add.image(this.unit.x, this.unit.y, "cannon");
    this.cannon.setTint(0xff4f00);

    this.cannon.setDisplaySize(
      gamePlayConfig.unitWidth - 12,
      gamePlayConfig.unitWidth - 12,
    );

    // cannon sprite faces DOWN at rotation = 0 (keep this)
    const SPRITE_OFFSET = -Math.PI / 2;

    // ✅ how much wider you want the sweep
    // example: 15 degrees wider on both sides
    const EXTRA_SWEEP = Phaser.Math.DegToRad(15);

    // ---------------------------------------------------------
    // 1) Pick which two towers this cannon should sweep between
    // ---------------------------------------------------------
    let aIndex: number | null = null;
    let bIndex: number | null = null;

    // Left Top
    if (this.tower.x === 0 && this.tower.y === 0) {
      aIndex = 1;
      bIndex = 3;
    }
    // Right TOP
    else if (this.tower.x > 0 && this.tower.y === 0) {
      aIndex = 0;
      bIndex = 2;
    }
    // Left Bottom
    else if (this.tower.x === 0 && this.tower.y > 0) {
      aIndex = 0;
      bIndex = 2;
    }
    // Right BOTTOM
    else if (this.tower.x > 0 && this.tower.y > 0) {
      aIndex = 3;
      bIndex = 1;
    }

    if (aIndex === null || bIndex === null) return;

    const a = gameRuntimeData.towers[aIndex] as any;
    const b = gameRuntimeData.towers[bIndex] as any;

    // ---------------------------------------------------------
    // 2) Compute angles toward towers
    // ---------------------------------------------------------
    let from =
      Phaser.Math.Angle.Between(this.cannon.x, this.cannon.y, a.aimX, a.aimY) +
      SPRITE_OFFSET;

    let to =
      Phaser.Math.Angle.Between(this.cannon.x, this.cannon.y, b.aimX, b.aimY) +
      SPRITE_OFFSET;

    // shortest arc between them
    const delta = Phaser.Math.Angle.Wrap(to - from);
    to = from + delta;

    // ---------------------------------------------------------
    // 3) Make sweep wider ("larger radius") by expanding ends
    // ---------------------------------------------------------
    if (to >= from) {
      from -= EXTRA_SWEEP;
      to += EXTRA_SWEEP;
    } else {
      from += EXTRA_SWEEP;
      to -= EXTRA_SWEEP;
    }

    // start at "from"
    this.cannon.rotation = from;

    // ---------------------------------------------------------
    // 4) Tween back and forth
    // ---------------------------------------------------------
    this.scene.tweens.add({
      targets: this.cannon,
      rotation: { from, to },
      duration: 2000,
      repeat: -1,
      yoyo: true,
      ease: "Linear",
    });

    if (isMain) {
      this.cannon.setAlpha(0);
    }
  }

  addHealth() {
    if (!this.cannon) return;
    this.health++;
    this.healthText.setText(this.health.toString());
  }

  changeCountry(newCountry: string, newColor: number, newBulletColor: number) {
    if (this.health > 1) {
      this.health--;
      this.healthText.setText(this.health.toString());
      return;
    }

    this.healthText?.destroy();
    this.towerImage?.destroy();

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
    // const border = this.scene.add.graphics();
    // border.lineStyle(2, 0x000000, 1);

    // const halfWidth = gamePlayConfig.unitWidth / 2;

    // border.strokeRect(
    //   this.unit.x - halfWidth,
    //   this.unit.y - halfWidth,
    //   gamePlayConfig.unitWidth,
    //   gamePlayConfig.unitWidth
    // );

    // border.setDepth(1000);
    // this.unit.setData("border", border);
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
      this.bulletColor,
      this.tower,
    );
    gameRuntimeData.bullets.push(this.bullet);
  }
}
