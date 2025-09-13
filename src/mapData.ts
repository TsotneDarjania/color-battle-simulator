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

export const mapSize = 15;

export const backgorundColor = 0xffffff;
export const borderColor = 0xde8f6d;

export const mapData: Record<string, CountryMapData> = {
  brazil: {
    rows: null,
    tower: { x: 0, y: 0 },
    color: 0x67ffc6,
    bulletColor: 0xffffff,
  },
  italy: {
    rows: null,
    tower: { x: 0, y: 13 },
    color: 0x9b0c28,
    bulletColor: 0x32d911,
  },
  germany: {
    rows: null,
    tower: { x: 13, y: 13 },
    color: 0x1e0942,
    bulletColor: 0xd91611,
  },
  spain: {
    rows: null,
    tower: { x: 13, y: 0 },
    color: 0x38d126,
    bulletColor: 0x000000,
  },
};
