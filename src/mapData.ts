// config/mapData.ts
export interface UnitRow {
  x: [number, number]; // inclusive range
  y: number;
}

export interface CountryMapData {
  rows: UnitRow[] | null;
  color: number;
  tower: { x: number; y: number };
  bulletColor: number;
}

export const mapSize = 20;

export const backgorundColor = 0xffffff;
export const borderColor = 0xde8f6d;

export const mapData: Record<string, CountryMapData> = {
  brazil: {
    rows: null,
    tower: { x: 0, y: 0 },
    color: 0xad030f,
    bulletColor: 0xFFFFFF,
  },
  italy: {
    rows: null,
    tower: { x: 0, y: 18 },
    color: 0x00ff44,
    bulletColor: 0x3d423e,
  },
  germany: {
    rows: null,
    tower: { x: 18, y: 18 },
     color: 0x4287f5,
    bulletColor: 0xFFFFFF,
  },
  spain: {
    rows: null,
    tower: { x: 18, y: 0 },
    color: 0xfff200,
    bulletColor: 0x0055ff,
  },
};
