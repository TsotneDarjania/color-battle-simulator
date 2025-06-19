import Phaser from "phaser";
import { Wheel } from "../components/wheel/wheel";
import { mapData } from "../mapData";
import GamePlay from "./GamePlay";

export default class CanvasScene extends Phaser.Scene {
  wheels: Array<Wheel> = [];
  gamePlaySceme!: GamePlay;

  constructor() {
    super("CanvasScene");
  }

  create() {
    this.gamePlaySceme = this.scene.get("GamePlay") as GamePlay;
    this.addWheels();
  }

  addWheels() {
    const mapKeys = Object.keys(mapData);
    const count = mapKeys.length;

    const wheelRadius = 150;
    const screenW = this.cameras.main.width;
    const screenH = this.cameras.main.height;

    const positions: { x: number; y: number }[] = [];

    switch (count) {
      case 1:
        positions.push({
          x: screenW * 0.5,
          y: screenH * 0.5,
        });
        break;
      case 2:
        positions.push(
          { x: screenW * 0.3, y: screenH * 0.5 },
          { x: screenW * 0.7, y: screenH * 0.5 }
        );
        break;
      case 3:
        positions.push(
          { x: screenW * 0.5, y: screenH * 0.25 },
          { x: screenW * 0.25, y: screenH * 0.7 },
          { x: screenW * 0.75, y: screenH * 0.7 }
        );
        break;
      default:
        positions.push(
          { x: screenW * 0.1, y: screenH * 0.27 },
          { x: screenW * 0.1, y: screenH * 0.75 },
          { x: screenW * 0.9, y: screenH * 0.75 },
          { x: screenW * 0.9, y: screenH * 0.27 }
        );
        break;
    }

    mapKeys.forEach((key, index) => {
      if (index >= positions.length) return;
      const pos = positions[index];
      const wheel = new Wheel(key, this, pos.x, pos.y, wheelRadius);
      this.wheels.push(wheel);
    });
  }

  // ✅ This is called from Wheel after spin+animation finishes
  onWheelResult(index: number, country: string, multiple: number) {
    console.log(`Wheel result: ${index}, Country is : ${country}`);

    switch (index) {
      case 0:
        this.gamePlaySceme.gameManager.openFire(country, multiple);
        break;
      case 2:
        this.gamePlaySceme.gameManager.buildCannon(country);
        break;
    }
    // Add your logic here (e.g. reward user, update game state, etc.)
  }
}
