import transitionProbabilityDefinition from "../../../common_definitions/base_layer/tile_gen/transition_probabilities.json";
import { Coordinates, TerrainType } from "../generated/proto/common_definitions/common";
import {
  TileDefinition,
  TileProperties,
} from "../generated/proto/common_definitions/map_2d";
import {
  MapCreateResponse,
  MapDimensions,
} from "../generated/proto/common_definitions/map_2d_message";
import type {
  MapCreateRequest,
  MapCreateResponse as MapCreateResponseMessage,
} from "../generated/proto/common_definitions/map_2d_message";

// TODO(backend): This whole module is a temporary frontend map service stand-in.
// Move generation behind the backend Map2DService.CreateMap implementation later.

type TerrainKey = "grass" | "dirt" | "mud" | "water" | "sand";

type TransitionProbabilities = {
  probabilities: Record<TerrainKey, Record<TerrainKey, number>>;
};

const transitionProbabilities =
  // TODO(backend): Stop bundling generation probabilities into the frontend once
  // the backend owns map generation and returns finished tiles.
  transitionProbabilityDefinition as TransitionProbabilities;

const terrainByKey: Record<TerrainKey, TerrainType> = {
  grass: TerrainType.GRASS,
  dirt: TerrainType.DIRT,
  mud: TerrainType.MUD,
  water: TerrainType.WATER,
  sand: TerrainType.SAND,
};

const terrainNameByKey: Record<TerrainKey, string> = {
  grass: "Grass",
  dirt: "Dirt",
  mud: "Mud",
  water: "Water",
  sand: "Sand",
};

export function generateMap(request: MapCreateRequest): MapCreateResponseMessage {
  const width = request.mapDimensions?.width ?? 0;
  const height = request.mapDimensions?.height ?? 0;
  const seed = request.seed?.trim() || "default-map";
  const random = createSeededRandom(seed);
  const terrainGrid: TerrainKey[][] = [];
  const tiles: TileDefinition[] = [];

  for (let y = 0; y < height; y++) {
    terrainGrid[y] = [];

    for (let x = 0; x < width; x++) {
      const terrainKey = chooseTerrainForTile(x, y, terrainGrid, random);
      terrainGrid[y][x] = terrainKey;
      tiles.push(createTile(x, y, terrainKey));
    }
  }

  return MapCreateResponse.create({
    mapDimensions: MapDimensions.create({ width, height }),
    seed,
    tiles,
  });
}

function chooseTerrainForTile(
  x: number,
  y: number,
  terrainGrid: TerrainKey[][],
  random: () => number,
): TerrainKey {
  if (x === 0 && y === 0) {
    return "grass";
  }

  const sourceTerrain = y > 0 ? terrainGrid[y - 1][x] : terrainGrid[y][x - 1];
  return chooseWeightedTerrain(sourceTerrain, random());
}

function chooseWeightedTerrain(sourceTerrain: TerrainKey, roll: number): TerrainKey {
  const probabilities = transitionProbabilities.probabilities[sourceTerrain];
  let runningTotal = 0;

  for (const terrainKey of Object.keys(probabilities) as TerrainKey[]) {
    runningTotal += probabilities[terrainKey];
    if (roll <= runningTotal) {
      return terrainKey;
    }
  }

  return sourceTerrain;
}

function createTile(x: number, y: number, terrainKey: TerrainKey): TileDefinition {
  return TileDefinition.create({
    id: `tile-${x}-${y}`,
    name: terrainNameByKey[terrainKey],
    properties: TileProperties.create({
      coordinates: Coordinates.create({ x, y, z: 0 }),
      terrainType: terrainByKey[terrainKey],
    }),
  });
}

function createSeededRandom(seed: string): () => number {
  let state = hashSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
