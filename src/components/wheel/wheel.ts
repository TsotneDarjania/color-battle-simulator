import { gameRuntimeData } from "../../gameRuntimeData";
import CanvasScene from "../../scenes/CanvasScene";

export class Wheel {
  wheelContainer!: Phaser.GameObjects.Container;
  arrow!: Phaser.GameObjects.Image;
  iconRefs: Phaser.GameObjects.Image[] = [];
  segmentRefs: Phaser.GameObjects.Graphics[] = [];
  textRefs: Phaser.GameObjects.Text[] = [];
  shootLabel!: Phaser.GameObjects.Text;
  isSpinning: boolean = false;
  autoSpinStarted: boolean = false;

  segmentAngles = [120, 120, 60, 60];
  baseColor = 0x222222;
  selectedColor = 0x4444aa;

  constructor(
    public country: string,
    public scene: CanvasScene,
    public x: number,
    public y: number,
    public radius: number,
    public colors: number[] = [0x222222, 0x222222, 0x222222, 0x222222]
  ) {
    this.init();
  }

  init() {
    this.addWheelShadow();
    this.wheelContainer = this.scene.add.container(this.x, this.y);
    this.drawWheelSegments();
    this.addIconsToSegments();
    this.addArrow();

    this.scene.input.keyboard.on("keydown-SPACE", () => {
      if (!this.isSpinning && !this.autoSpinStarted) {
        this.spin(); // Spin once
        this.startAutoSpin(); // Then start auto-spin
      }
    });
  }

  startAutoSpin() {
    this.autoSpinStarted = true;

    this.scene.time.addEvent({
      delay: 2500,
      loop: true,
      callback: () => {
        if (!this.isSpinning) {
          this.spin();
        }
      },
    });
  }

  addWheelShadow() {
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x888888, 0.2);
    shadow.fillCircle(this.x, this.y, this.radius + 15);
    shadow.setDepth(-1);
  }

  drawWheelSegments() {
    let currentAngle = 0;
    for (let i = 0; i < this.segmentAngles.length; i++) {
      const graphics = this.scene.add.graphics();
      const color = this.baseColor;
      const startAngle = Phaser.Math.DegToRad(currentAngle);
      const endAngle = Phaser.Math.DegToRad(
        currentAngle + this.segmentAngles[i]
      );

      graphics.fillStyle(color, 1);
      graphics.beginPath();
      graphics.moveTo(0, 0);
      graphics.arc(0, 0, this.radius, startAngle, endAngle, false);
      graphics.closePath();
      graphics.fillPath();

      graphics.lineStyle(6, 0x000000, 0.25);
      graphics.strokePath();
      graphics.lineStyle(3, 0xffffff, 0.2);
      graphics.strokePath();

      this.wheelContainer.add(graphics);
      this.segmentRefs.push(graphics);

      currentAngle += this.segmentAngles[i];
    }
  }

  addIconsToSegments() {
    const iconKeys = ["shoot", "empty", "new-cannon", "multiple-bullet"];
    let currentAngle = 0;
    const iconRadius = this.radius * 0.65;

    for (let i = 0; i < this.segmentAngles.length; i++) {
      const midAngle = currentAngle + this.segmentAngles[i] / 2;
      const angleRad = Phaser.Math.DegToRad(midAngle);
      const x = Math.cos(angleRad) * iconRadius;
      const y = Math.sin(angleRad) * iconRadius;

      const icon = this.scene.add.image(x, y, iconKeys[i]);
      icon.setScale(iconKeys[i] === "new-cannon" ? 0.8 : 0.5);
      icon.setRotation(angleRad + Math.PI / 2);
      icon.setDepth(2);
      this.wheelContainer.add(icon);
      this.iconRefs.push(icon);

      if (iconKeys[i] === "shoot") {
        const textDistance = iconRadius + 30;
        const textX = Math.cos(angleRad) * textDistance;
        const textY = Math.sin(angleRad) * textDistance;

        const text = this.scene.add.text(textX, textY, "1", {
          fontSize: "18px",
          color: "#ffffff",
          fontStyle: "bold",
          align: "center",
        });

        text.setOrigin(0.5);
        text.setRotation(angleRad + Math.PI / 2);
        text.setDepth(3);
        text.setShadow(1, 1, "#000000", 2, false, true);

        this.wheelContainer.add(text);
        this.textRefs.push(text);
        this.shootLabel = text;
      }

      currentAngle += this.segmentAngles[i];
    }
  }

  addArrow() {
    this.arrow = this.scene.add.image(this.x, this.y, "arrow");
    this.arrow.setOrigin(0.5);
    this.arrow.setScale(2);
    this.arrow.setDepth(10);
  }

  spin(
    onComplete?: (index: number, country: string, multiple: number) => void
  ) {
    const units = gameRuntimeData.units.filter(
      (u) => u.country === this.country
    );
    if (units.length === 0) {
      this.destroy();
      return;
    }

    this.isSpinning = true;

    this.segmentRefs.forEach((seg) => {
      this.scene.tweens.add({
        targets: seg,
        alpha: 0.6,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    const totalSpins = 6;
    const randomOffset = Phaser.Math.Between(0, 359);
    const targetAngle = totalSpins * 360 + randomOffset;

    this.scene.tweens.add({
      targets: this.arrow,
      angle: targetAngle,
      duration: 2800,
      ease: "Cubic.easeOut",
      onComplete: () => {
        const finalArrowAngle = ((this.arrow.angle % 360) + 360) % 360;
        const relativeAngle = finalArrowAngle;

        let angleSum = 0;
        let index = 0;
        for (let i = 0; i < this.segmentAngles.length; i++) {
          angleSum += this.segmentAngles[i];
          if (relativeAngle < angleSum) {
            index = i;
            break;
          }
        }

        const segment = this.segmentRefs[index];
        const icon = this.iconRefs[index];
        const iconKey = icon.texture.key;

        this.segmentRefs.forEach((seg) => {
          seg.alpha = 1;
          this.scene.tweens.killTweensOf(seg);
        });

        segment.clear();
        const start = this.segmentAngles
          .slice(0, index)
          .reduce((a, b) => a + b, 0);
        const end = start + this.segmentAngles[index];
        segment.fillStyle(this.selectedColor, 1);
        segment.beginPath();
        segment.moveTo(0, 0);
        segment.arc(
          0,
          0,
          this.radius,
          Phaser.Math.DegToRad(start),
          Phaser.Math.DegToRad(end)
        );
        segment.closePath();
        segment.fillPath();
        segment.lineStyle(6, 0x000000, 0.25);
        segment.strokePath();
        segment.lineStyle(3, 0xffffff, 0.2);
        segment.strokePath();

        const baseScale = iconKey === "new-cannon" ? 0.8 : 0.5;
        const animatedScale = baseScale + 0.2;

        this.scene.tweens.add({
          targets: icon,
          scale: animatedScale,
          duration: 300,
          yoyo: true,
          repeat: 3,
          ease: "Sine.easeInOut",
        });

        const blinkTween = this.scene.tweens.add({
          targets: segment,
          alpha: 0.2,
          duration: 100,
          yoyo: true,
          repeat: 4,
        });

        if (iconKey === "multiple-bullet") {
          const value = parseInt(this.shootLabel.text);
          if (value < 30) {
            this.shootLabel.setText((value + 1).toString());
          }
        }

        this.scene.time.delayedCall(1600, () => {
          this.iconRefs.forEach((icon, i) => {
            const key = icon.texture.key;
            icon.setScale(key === "new-cannon" ? 0.8 : 0.5);
          });

          this.segmentRefs.forEach((seg, i) => {
            seg.clear();
            const s = this.segmentAngles.slice(0, i).reduce((a, b) => a + b, 0);
            const e = s + this.segmentAngles[i];
            seg.fillStyle(this.baseColor, 1);
            seg.beginPath();
            seg.moveTo(0, 0);
            seg.arc(
              0,
              0,
              this.radius,
              Phaser.Math.DegToRad(s),
              Phaser.Math.DegToRad(e)
            );
            seg.closePath();
            seg.fillPath();
            seg.lineStyle(6, 0x000000, 0.25);
            seg.strokePath();
            seg.lineStyle(3, 0xffffff, 0.2);
            seg.strokePath();
            seg.alpha = 1;
          });

          blinkTween.remove();
          this.isSpinning = false;

          const multiple = parseInt(this.shootLabel.text);
          this.scene.onWheelResult?.(index, this.country, multiple);
          onComplete?.(index, this.country, multiple);
        });
      },
    });
  }

  destroy() {
    this.iconRefs.forEach((i) => i.destroy());
    this.segmentRefs.forEach((s) => s.destroy());
    this.textRefs.forEach((t) => t.destroy());
    this.arrow?.destroy();
    this.shootLabel?.destroy();
    this.wheelContainer?.destroy();

    const index = this.scene.wheels?.indexOf(this);
    if (index !== -1) {
      this.scene.wheels.splice(index, 1);
    }
  }
}
