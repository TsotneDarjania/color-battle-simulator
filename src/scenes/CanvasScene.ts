import Phaser from "phaser";
import { Wheel } from "../components/wheel/wheel";
import { mapData } from "../mapData";
import GamePlay from "./GamePlay";

export default class CanvasScene extends Phaser.Scene {
  wheels: Array<Wheel> = [];
  gamePlaySceme!: GamePlay;
  overlay!: Phaser.GameObjects.Rectangle;
  startText!: Phaser.GameObjects.Text;
  infoTextLeft!: Phaser.GameObjects.Text;
  infoTextKeys!: Phaser.GameObjects.Text;
  infoTextRight!: Phaser.GameObjects.Text;
  controlsEnabled = false;

  constructor() {
    super("CanvasScene");
  }

  create() {
    this.gamePlaySceme = this.scene.get("GamePlay") as GamePlay;

    this.addWheels();
    this.addOverlayAndText();

    this.input.keyboard.on("keydown-SPACE", () => {
      if (!this.controlsEnabled) {
        this.overlay.setVisible(false);
        this.startText.setVisible(false);
        this.infoTextLeft.setVisible(false);
        this.infoTextKeys.setVisible(false);
        this.infoTextRight.setVisible(false);
        this.controlsEnabled = true;
      }
    });
  }

  addWheels() {
    const mapKeys = Object.keys(mapData);
    const count = mapKeys.length;

    const screenW = this.cameras.main.width;
    const screenH = this.cameras.main.height;

    const wheelRadius = Math.min(screenW, screenH) * 0.18;
    const marginX = screenW * 0.05;
    const marginY = screenH * 0.05;

    const positions: { x: number; y: number }[] = [];

    if (count <= 4) {
      const corners = [
        { x: marginX + wheelRadius, y: marginY + wheelRadius }, // top-left (1)
        { x: marginX + wheelRadius, y: screenH - marginY - wheelRadius }, // bottom-left (4)
        {
          x: screenW - marginX - wheelRadius,
          y: screenH - marginY - wheelRadius,
        }, // bottom-right (2)
        { x: screenW - marginX - wheelRadius, y: marginY + wheelRadius }, // top-right (3)
      ];
      positions.push(...corners.slice(0, count));
    } else {
      const centerX = screenW / 2;
      const centerY = screenH / 2;
      const radius = Math.min(screenW, screenH) * 0.3;

      for (let i = 0; i < count; i++) {
        const angle = ((2 * Math.PI) / count) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({ x, y });
      }
    }

    mapKeys.forEach((key, index) => {
      if (index >= positions.length) return;
      const pos = positions[index];
      const wheel = new Wheel(key, this, pos.x, pos.y, wheelRadius);
      this.wheels.push(wheel);
    });
  }

  addOverlayAndText() {
    const { width, height } = this.cameras.main;

    // Dark transparent overlay
    this.overlay = this.add
      .rectangle(0, 0, width * 2, height * 2, 0x000000, 0.75)
      .setOrigin(0)
      .setDepth(10);

    // Main title
    this.startText = this.add
      .text(width / 2, height / 2 - 60, "Press SPACE to start simulation", {
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
      })
      .setOrigin(0.5)
      .setDepth(11);

    // Instruction parts
    const instruction = "Use ";
    const keys = "ASDW";
    const rest = " to move camera, Q to zoom out, E to zoom in";

    const baseY = height / 2 + 10;
    const baseX = width / 2;
    const spacer = 6;

    this.infoTextLeft = this.add
      .text(0, 0, instruction, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#dddddd",
      })
      .setOrigin(0, 0.5)
      .setDepth(11);

    this.infoTextKeys = this.add
      .text(0, 0, keys, {
        fontFamily: "Arial Black",
        fontSize: "28px",
        color: "#ffff66",
        stroke: "#000000",
        strokeThickness: 3,
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: "#000000",
          blur: 4,
          fill: true,
        },
      })
      .setOrigin(0, 0.5)
      .setDepth(11);

    this.infoTextRight = this.add
      .text(0, 0, rest, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#dddddd",
      })
      .setOrigin(0, 0.5)
      .setDepth(11);

    // Center alignment of combined text
    const totalWidth =
      this.infoTextLeft.width +
      this.infoTextKeys.width +
      this.infoTextRight.width +
      spacer * 2;

    let x = baseX - totalWidth / 2;
    this.infoTextLeft.setPosition(x, baseY);
    x += this.infoTextLeft.width + spacer;
    this.infoTextKeys.setPosition(x, baseY);
    x += this.infoTextKeys.width + spacer;
    this.infoTextRight.setPosition(x, baseY);
  }

  onWheelResult(index: number, country: string, multiple: number) {
    console.log(`Wheel result: ${index}, Country is: ${country}`);
    switch (index) {
      case 0:
        this.gamePlaySceme.gameManager.openFire(country, multiple);
        break;
      case 2:
        this.gamePlaySceme.gameManager.buildCannon(country);
        break;
    }
  }
}
