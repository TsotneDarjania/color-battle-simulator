// config/mapData.ts
export interface UnitRow {
  x: [number, number]; // inclusive range
  y: number;
}

export interface CountryMapData {
  rows: UnitRow[];
  color: number;
}

export const mapSize = 15;

export const mapData: Record<string, CountryMapData> = {
  georgia: {
    rows: [{ x: [0, 0], y: 0 }],
    color: 0x67ffc6,
  },
  armenia: {
    rows: [{ x: [0, 0], y: 14 }],
    color: 0x9b0c28,
  },
  india: {
    rows: [{ x: [14, 14], y: 14 }],
    color: 0x1e0942,
  },
  russia: {
    rows: [{ x: [14, 14], y: 0 }],
    color: 0x38d126,
  },
  // Add more countries here...
};
