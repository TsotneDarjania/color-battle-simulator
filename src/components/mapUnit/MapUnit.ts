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
    public bulletColor: number,
    public tower: { x: number; y: number },
  ) {
    this.unit = scene.unitGroup.create(
      x + gamePlayConfig.unitWidth / 2,
      y + gamePlayConfig.unitWidth / 2,
      "rect",
    ) as Phaser.Physics.Arcade.Image;

    this.unit.setImmovable(true);
    this.unit.setDisplaySize(
      gamePlayConfig.unitWidth,
      gamePlayConfig.unitWidth,
    );
    this.unit.setSize(gamePlayConfig.unitWidth, gamePlayConfig.unitWidth);
    this.unit.setOffset(-9, -9);
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
      gamePlayConfig.unitWidth,
    );

    border.setDepth(1); // make sure it's above the unit
    this.unit.setData("border", border); // store border for potential cleanup
  }

  addCannon() {
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
  }

  shoot() {
    if (!this.cannon) return;

    // MUST MATCH addCannon()
    const SPRITE_OFFSET = -Math.PI / 2;

    const spriteR = this.cannon.rotation; // how sprite is rotated
    const worldR = spriteR - SPRITE_OFFSET; // real aiming direction

    // ---- Spawn position (use sprite rotation, because muzzle is on the sprite) ----
    const dist = (gamePlayConfig.unitWidth - 12) / 2 + 6;

    // your cannon art faces DOWN at rotation=0 => local muzzle vector is (0, +dist)
    const muzzleVec = new Phaser.Math.Vector2(0, dist).rotate(spriteR);

    const bulletX = this.cannon.x + muzzleVec.x;
    const bulletY = this.cannon.y + muzzleVec.y;

    // ---- Bullet direction (use world rotation) ----
    this.bullet = new Bullet(
      this.scene,
      bulletX,
      bulletY,
      worldR, // ✅ IMPORTANT: radians without sprite offset
      this.country,
      this.color,
      this.bulletColor,
      this.tower,
    );

    gameRuntimeData.bullets.push(this.bullet);
  }

  changeCountry(
    newCountry: string,
    newColor: number,
    newBulletColor: number,
    newTower: { x: number; y: number },
  ) {
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
    this.tower = newTower;
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
      gamePlayConfig.unitWidth,
    );

    border.setDepth(1000);
    this.unit.setData("border", border);
  }
}
