import { gamePlayConfig } from "../../config";
import { gameRuntimeData } from "../../gameRuntimeData";
import { CountryMapData, mapData, mapSize } from "../../mapData";
import GamePlay from "../../scenes/GamePlay";
import MapUnit from "../mapUnit/MapUnit";

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
      this.createCountryUnits(countryName, countryMap);
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
          .setTint(0x08191f)
      );

      // Bottom
      this.borders.push(
        this.scene.physics.add
          .staticImage(centerX, mapPixelSize + unitSize / 2, "rect")
          .setDisplaySize(unitSize, unitSize)
          .setOrigin(0.5)
          .refreshBody()
          .setImmovable(true)
          .setTint(0x08191f)
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
          .setTint(0x08191f)
      );

      // Right
      this.borders.push(
        this.scene.physics.add
          .staticImage(mapPixelSize + unitSize / 2, centerY, "rect")
          .setDisplaySize(unitSize, unitSize)
          .setOrigin(0.5)
          .refreshBody()
          .setImmovable(true)
          .setTint(0x08191f)
      );
    }
  }

  private createCountryUnits(countryName: string, data: CountryMapData) {
    const unitSize = gamePlayConfig.unitWidth;

    data.rows.forEach((row) => {
      for (let x = row.x[0]; x <= row.x[1]; x++) {
        const posKey = `${x},${row.y}`;
        this.occupied.add(posKey);

        const mapUnit = new MapUnit(
          this.scene,
          x * unitSize,
          row.y * unitSize,
          data.color,
          countryName
        );

        gameRuntimeData.units.push(mapUnit);
      }
    });
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
            0x040c12,
            "default"
          );

          gameRuntimeData.units.push(mapUnit);
        }
      }
    }
  }
}
