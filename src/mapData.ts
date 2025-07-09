// config/mapData.ts
export interface UnitRow {
  x: [number, number]; // inclusive range
  y: number;
}

export interface CountryMapData {
  rows: UnitRow[];
  color: number;
  bulletColor: number;
}

export const mapSize = 15;

export const backgorundColor = 0xffffff;
export const borderColor = 0xde8f6d;

export const mapData: Record<string, CountryMapData> = {
  brazil: {
    rows: [{ x: [0, 0], y: 0 }],
    color: 0x67ffc6,
    bulletColor: 0xffffff,
  },
  italy: {
    rows: [{ x: [0, 0], y: 14 }],
    color: 0x9b0c28,
    bulletColor: 0x32d911,
  },
  germany: {
    rows: [{ x: [14, 14], y: 14 }],
    color: 0x1e0942,
    bulletColor: 0xd91611,
  },
  spain: {
    rows: [{ x: [14, 14], y: 0 }],
    color: 0x38d126,
    bulletColor: 0x000000,
  },
  // Add more countries here...
};
