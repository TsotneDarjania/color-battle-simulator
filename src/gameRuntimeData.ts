import Bullet from "./components/bullet/bullet";
import MapUnit from "./components/mapUnit/MapUnit";
import Tower from "./components/tower/tower";

export type GameRuntimeData = {
  units: Array<MapUnit | Tower>;
  bullets: Array<Bullet>;
  towers : Array<Tower>
};
export const gameRuntimeData: GameRuntimeData = {
  units: [],
  bullets: [],
  towers : []
};
