import { gameRuntimeData } from "../../gameRuntimeData";
import CanvasScene from "../../scenes/CanvasScene";

export class Wheel {
  wheelContainer!: Phaser.GameObjects.Container;
  arrow!: Phaser.GameObjects.Triangle;
  iconRefs: Phaser.GameObjects.Image[] = [];
  segmentRefs: Phaser.GameObjects.Graphics[] = [];
  textRefs: Phaser.GameObjects.Text[] = [];
  shootLabel!: Phaser.GameObjects.Text;
  isSpinning: boolean = false;

  segmentAngles = [120, 120, 60, 60]; // total = 360

  constructor(
    public country: string,
    public scene: CanvasScene,
    public x: number,
    public y: number,
    public radius: number,
    public colors: number[] = [0x590a20, 0xedd654, 0xb7deed, 0xffff00]
  ) {
    this.init();
  }

  init() {
    this.wheelContainer = this.scene.add.container(this.x, this.y);
    this.wheelContainer.angle = 0;

    this.drawWheelSegments();
    this.addIconsToSegments();
    this.addArrow();

    // Manual spin
    this.scene.input.keyboard.on("keydown-SPACE", () => {
      if (!this.isSpinning) {
        this.spin();
      }
    });

    // Auto-spin every 4s
    this.scene.time.addEvent({
      delay: 4000,
      loop: true,
      callback: () => {
        if (!this.isSpinning) {
          this.spin();
        }
      },
    });
  }

  drawWheelSegments() {
    let currentAngle = 0;
    for (let i = 0; i < this.segmentAngles.length; i++) {
      const graphics = this.scene.add.graphics();
      const color = this.colors[i % this.colors.length];
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

      graphics.lineStyle(1, 0x000000, 1);
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
      icon.setScale(0.5);
      icon.setRotation(angleRad + Math.PI / 2);
      this.wheelContainer.add(icon);
      this.iconRefs.push(icon);

      // "shoot" label
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
        this.wheelContainer.add(text);
        this.textRefs.push(text);
        this.shootLabel = text;
      }

      currentAngle += this.segmentAngles[i];
    }
  }

  addArrow() {
    const arrowHeight = 30;
    const arrowWidth = 40;

    this.arrow = this.scene.add.triangle(
      this.x,
      this.y - this.radius - arrowHeight,
      0,
      0,
      arrowWidth,
      0,
      arrowWidth / 2,
      arrowHeight,
      0xff0000
    );
    this.arrow.setOrigin(0.5, 0.5);
  }

  spin(
    onComplete?: (index: number, country: string, multiple: number) => void
  ) {
    const units = gameRuntimeData.units.filter(
      (unit) => unit.country === this.country
    );

    if (units.length === 0) {
      this.destroy(); // ✅ Remove wheel if no units exist
      return;
    }

    this.isSpinning = true;

    const totalSpins = 6;
    const randomOffset = Phaser.Math.Between(0, 359);
    const targetAngle = totalSpins * 360 + randomOffset;

    this.scene.tweens.add({
      targets: this.wheelContainer,
      angle: targetAngle,
      duration: 3000,
      ease: "Cubic.easeOut",
      onComplete: () => {
        const finalWheelAngle = ((this.wheelContainer.angle % 360) + 360) % 360;
        const arrowDirection = 270;
        const relativeAngle = (arrowDirection - finalWheelAngle + 360) % 360;

        let angleSum = 0;
        let index = 0;
        for (let i = 0; i < this.segmentAngles.length; i++) {
          angleSum += this.segmentAngles[i];
          if (relativeAngle < angleSum) {
            index = i;
            break;
          }
        }

        const icon = this.iconRefs[index];
        const segment = this.segmentRefs[index];

        this.scene.tweens.add({
          targets: icon,
          scale: 0.7,
          duration: 400,
          yoyo: true,
          repeat: 4,
          ease: "Sine.easeInOut",
        });

        const flashTween = this.scene.tweens.add({
          targets: segment,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 6,
        });

        const iconKeys = ["shoot", "empty", "new-cannon", "multiple-bullet"];
        if (iconKeys[index] === "multiple-bullet") {
          const currentValue = parseInt(this.shootLabel.text);
          if (currentValue < 30) {
            this.shootLabel.setText((currentValue + 1).toString());
          }
        }

        this.scene.time.delayedCall(2500, () => {
          this.iconRefs.forEach((icon) => icon.setScale(0.5));
          this.segmentRefs.forEach((s) => (s.alpha = 1));
          flashTween.remove();
          this.isSpinning = false;

          const multiple = parseInt(this.shootLabel.text);
          this.scene.onWheelResult?.(index, this.country, multiple);
          onComplete?.(index, this.country, multiple);
        });
      },
    });
  }

  destroy() {
    this.iconRefs.forEach((icon) => icon.destroy());
    this.segmentRefs.forEach((seg) => seg.destroy());
    this.textRefs.forEach((text) => text.destroy());
    this.arrow?.destroy();
    this.shootLabel?.destroy();
    this.wheelContainer?.destroy();

    const index = this.scene.wheels?.indexOf(this);
    if (index !== -1) {
      this.scene.wheels.splice(index, 1);
    }
  }
}
