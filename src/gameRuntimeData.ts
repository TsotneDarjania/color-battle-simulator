import Bullet from "./components/bullet/bullet";
import MapUnit from "./components/mapUnit/MapUnit";

export type GameRuntimeData = {
  units: Array<MapUnit>;
  bullets: Array<Bullet>;
};
export const gameRuntimeData: GameRuntimeData = {
  units: [],
  bullets: [],
};
