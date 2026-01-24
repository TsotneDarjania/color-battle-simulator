import { gamePlayConfig } from "../../config";
import { gameRuntimeData } from "../../gameRuntimeData";
import {
  backgorundColor,
  borderColor,
  CountryMapData,
  mapData,
  mapSize,
} from "../../mapData";
import GamePlay from "../../scenes/GamePlay";
import MapUnit from "../mapUnit/MapUnit";
import Tower from "../tower/tower";

export class GameMap {
  private occupied = new Set<string>();
  borders: Array<Phaser.Physics.Arcade.Image> = [];

  constructor(public scene: GamePlay) {
    this.generateMap();
    this.addBorderWalls();
  }

  generateMap() {
    // First add countries
    Object.entries(mapData).forEach(([countryName, countryMap]) => {
      this.createTowers(countryName, countryMap);
    });

    // Then fill the rest with default gray units
    this.createDefaultUnits();
  }

  addBorderWalls() {
    const unitSize = gamePlayConfig.unitWidth;
    const mapPixelSize = mapSize * unitSize;

    // Top and Bottom border (x from -1 to mapSize)
    for (let x = -1; x <= mapSize; x++) {
      const centerX = x * unitSize + unitSize / 2;

      // Top
      this.borders.push(
        this.scene.physics.add
          .staticImage(centerX, 0 - unitSize / 2, "rect")
          .setDisplaySize(unitSize, unitSize)
          .setOrigin(0.5)
          .refreshBody()
          .setImmovable(true)
          .setTint(borderColor),
      );

      // Bottom
      this.borders.push(
        this.scene.physics.add
          .staticImage(centerX, mapPixelSize + unitSize / 2, "rect")
          .setDisplaySize(unitSize, unitSize)
          .setOrigin(0.5)
          .refreshBody()
          .setImmovable(true)
          .setTint(borderColor),
      );
    }

    // Left and Right border (y from -1 to mapSize)
    for (let y = -1; y <= mapSize; y++) {
      const centerY = y * unitSize + unitSize / 2;

      // Left
      this.borders.push(
        this.scene.physics.add
          .staticImage(0 - unitSize / 2, centerY, "rect")
          .setDisplaySize(unitSize, unitSize)
          .setOrigin(0.5)
          .refreshBody()
          .setImmovable(true)
          .setTint(borderColor),
      );

      // Right
      this.borders.push(
        this.scene.physics.add
          .staticImage(mapPixelSize + unitSize / 2, centerY, "rect")
          .setDisplaySize(unitSize, unitSize)
          .setOrigin(0.5)
          .refreshBody()
          .setImmovable(true)
          .setTint(borderColor),
      );
    }
  }

  private createTowers(countryName: string, data: CountryMapData) {
    const tower = new Tower(
      this.scene,
      data.tower.x, // GRID X
      data.tower.y, // GRID Y
      data.color,
      countryName,
      data.bulletColor,
      data.tower,
    );

    setTimeout(() => {
      tower.addCannon(true);
    }, 1000);

    gameRuntimeData.units.push(tower);
    gameRuntimeData.towers.push(tower);

    // occupy 2x2 tiles
    this.occupied.add(`${data.tower.x},${data.tower.y}`);
    this.occupied.add(`${data.tower.x + 1},${data.tower.y}`);
    this.occupied.add(`${data.tower.x},${data.tower.y + 1}`);
    this.occupied.add(`${data.tower.x + 1},${data.tower.y + 1}`);
  }

  private createDefaultUnits() {
    const unitSize = gamePlayConfig.unitWidth;

    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        const posKey = `${x},${y}`;
        if (!this.occupied.has(posKey)) {
          const mapUnit = new MapUnit(
            this.scene,
            x * unitSize,
            y * unitSize,
            backgorundColor,
            "default",
            0x000000,
            { x: 0, y: 0 },
          );

          gameRuntimeData.units.push(mapUnit);
        }
      }
    }
  }
}
