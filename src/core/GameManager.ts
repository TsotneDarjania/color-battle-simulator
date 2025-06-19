import MapUnit from "../components/mapUnit/MapUnit";
import { gameRuntimeData } from "../gameRuntimeData";
import CanvasScene from "../scenes/CanvasScene";
import GamePlay from "../scenes/GamePlay";
import { getRandomIntNumber } from "../utils";

export class GameManager {
  constructor(public gamePLay: GamePlay, publiccanvasScene: CanvasScene) {
    this.addCollisions();
  }

  addCollisions() {}

  buildCannon(country: string) {
    const targetUnits = gameRuntimeData.units.filter(
      (unit) => unit.country === country
    );
    const targetUnit = targetUnits[getRandomIntNumber(0, targetUnits.length)];

    let allHasCannon = true;
    targetUnits.forEach((unit) => {
      if (!unit.cannon) allHasCannon = false;
    });

    if (allHasCannon) return;

    if (targetUnit.cannon) {
      this.buildCannon(country);
      return;
    }

    targetUnit.addCannon();
  }

  openFire(country: string, multiple: number) {
    const targetUnits = gameRuntimeData.units.filter(
      (unit) => unit.country === country
    );

    const unitsWhoHasCannons = targetUnits.filter((unit) => unit.cannon);

    unitsWhoHasCannons.forEach((unit) => {
      let shotCount = 0;

      this.gamePLay.time.addEvent({
        delay: 100,
        repeat: multiple - 1, // because it fires once on the first tick and (repeat) times after
        callback: () => {
          unit.shoot();
          shotCount++;
        },
      });
    });
  }
}
