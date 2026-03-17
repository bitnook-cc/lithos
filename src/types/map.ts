/** Cube coordinates for hex grid */
export interface HexCoord {
  q: number;
  r: number;
  s: number;
}

export type TileType = 'plains' | 'forest' | 'mountain' | 'water' | 'desert' | 'ruins' | 'fertile' | 'special' | 'rainforest' | 'swamp' | 'hills' | 'snow' | 'ice';

export interface Tile {
  coord: HexCoord;
  type: TileType;
  visible: boolean;
  controlled: boolean;
  building: string | null;
  rivalId: string | null;
}
