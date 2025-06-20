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
  orientationText!: Phaser.GameObjects.Text;
  controlsEnabled = false;

  controlButtons: Phaser.GameObjects.Text[] = [];

  constructor() {
    super("CanvasScene");
  }

  create() {
    this.checkOrientation();

    this.gamePlaySceme = this.scene.get("GamePlay") as GamePlay;

    this.addWheels();
    this.addOverlayAndText();
    this.createMobileControls();

    const startSimulation = () => {
      if (this.controlsEnabled) return;

      this.overlay?.setVisible(false);
      this.startText?.setVisible(false);
      this.infoTextLeft?.setVisible(false);
      this.infoTextKeys?.setVisible(false);
      this.infoTextRight?.setVisible(false);
      this.controlsEnabled = true;

      this.controlButtons.forEach((btn) => btn.setVisible(true));

      // Trigger all wheels to spin
      this.wheels.forEach((wheel) => {
        if (!wheel.isSpinning && typeof wheel.spin === "function") {
          wheel.spin();
        }
      });
    };

    // Start on pointer (tap/click) for all platforms
    this.input.once("pointerdown", startSimulation);

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        if (window.innerHeight < window.innerWidth) {
          window.location.reload();
        }
      }, 500);
    });
  }

  checkOrientation() {
    const isMobile =
      this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    if (!isMobile) return;

    if (window.innerHeight > window.innerWidth) {
      const { width, height } = this.sys.game.canvas;

      this.add
        .rectangle(0, 0, width * 2, height * 2, 0x000000, 0.9)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(999);

      this.orientationText = this.add
        .text(width / 2, height / 2, "Please rotate your phone", {
          fontFamily: "Arial",
          fontSize: "42px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(1000);

      this.scene.pause();
    }
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
        { x: marginX + wheelRadius, y: marginY + wheelRadius },
        { x: marginX + wheelRadius, y: screenH - marginY - wheelRadius },
        {
          x: screenW - marginX - wheelRadius,
          y: screenH - marginY - wheelRadius,
        },
        { x: screenW - marginX - wheelRadius, y: marginY + wheelRadius },
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

    this.overlay = this.add
      .rectangle(0, 0, width * 2, height * 2, 0x000000, 0.75)
      .setOrigin(0)
      .setDepth(10);

    this.startText = this.add
      .text(width / 2, height / 2 - 60, "Tap to start simulation", {
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

  createMobileControls() {
    const isMobile =
      this.sys.game.device.os.android || this.sys.game.device.os.iOS;
    if (!isMobile) return;

    const { width, height } = this.cameras.main;
    const btnSize = 50;
    const moveSpeed = 40;
    const zoomSpeed = 0.08;
    const paddingBetween = 10;

    const camTarget = this.gamePlaySceme.cameraTarget;
    const controlIntervals: { [key: string]: number } = {};

    const makeBtn = (
      label: string,
      x: number,
      y: number,
      action: () => void
    ) => {
      const btn = this.add
        .text(x, y, label, {
          fontFamily: "Arial",
          fontSize: "28px",
          backgroundColor: "#444",
          color: "#fff",
          fixedWidth: btnSize,
          fixedHeight: btnSize,
          align: "center",
          padding: { top: 8, bottom: 8, left: 12, right: 12 },
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      btn.on("pointerdown", () => {
        action();
        controlIntervals[label] = window.setInterval(action, 100);
      });

      btn.on("pointerup", () => clearInterval(controlIntervals[label]));
      btn.on("pointerout", () => clearInterval(controlIntervals[label]));
      btn.on("pointerupoutside", () => clearInterval(controlIntervals[label]));

      this.controlButtons.push(btn);
    };

    const centerX = width / 2;
    const baseY = height - btnSize * 2.2;

    makeBtn("↑", centerX, baseY - btnSize, () => (camTarget.y -= moveSpeed));
    makeBtn("↓", centerX, baseY + btnSize, () => (camTarget.y += moveSpeed));
    makeBtn("←", centerX - btnSize, baseY, () => (camTarget.x -= moveSpeed));
    makeBtn("→", centerX + btnSize, baseY, () => (camTarget.x += moveSpeed));

    const zoomX = centerX + btnSize * 2.2;
    makeBtn("+", zoomX, baseY - btnSize / 2, () => {
      camTarget.zoom = Phaser.Math.Clamp(camTarget.zoom + zoomSpeed, 0.2, 3);
    });
    makeBtn("−", zoomX, baseY + btnSize / 2 + paddingBetween, () => {
      camTarget.zoom = Phaser.Math.Clamp(camTarget.zoom - zoomSpeed, 0.2, 3);
    });
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
