// config/mapData.ts
export interface UnitRow {
  x: [number, number]; // inclusive range
  y: number;
}

export interface CountryMapData {
  rows: UnitRow[];
  color: number;
}

export const mapSize = 14;

export const mapData: Record<string, CountryMapData> = {
  georgia: {
    rows: [{ x: [0, 0], y: 0 }],
    color: 0x67ffc6,
  },
  armenia: {
    rows: [{ x: [0, 0], y: 13 }],
    color: 0xc22625,
  },
  india: {
    rows: [{ x: [13, 13], y: 13 }],
    color: 0x1e0942,
  },
  russia: {
    rows: [{ x: [13, 13], y: 0 }],
    color: 0x2b570a,
  },
  // Add more countries here...
};
