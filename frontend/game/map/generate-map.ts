import transitionProbabilityDefinition from "../../../common_definitions/base_layer/tile_gen/transition_probabilities.json";
import { Coordinates, TerrainType } from "../generated/proto/common_definitions/common";
import {
  TileDefinition,
  TileProperties,
} from "../generated/proto/common_definitions/map_2d";
import {
  MapGenerationStrategy,
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
  const strategy =
    request.generationStrategy === MapGenerationStrategy.UNSPECIFIED
      ? MapGenerationStrategy.BLENDED_NEIGHBOR_WEIGHTS
      : request.generationStrategy;
  const random = createSeededRandom(seed);
  const terrainGrid: TerrainKey[][] = [];
  const tiles: TileDefinition[] = [];

  for (let y = 0; y < height; y++) {
    terrainGrid[y] = [];

    for (let x = 0; x < width; x++) {
      const terrainKey = chooseTerrainForTile(x, y, terrainGrid, random, strategy);
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
  strategy: MapGenerationStrategy,
): TerrainKey {
  if (x === 0 && y === 0) {
    return "grass";
  }

  const neighborTerrains = getKnownNeighborTerrains(x, y, terrainGrid);

  if (neighborTerrains.length === 0) {
    return "grass";
  }

  if (strategy === MapGenerationStrategy.WEIGHTED_NEIGHBOR_VOTE) {
    return chooseByWeightedNeighborVote(neighborTerrains, random);
  }

  return chooseByBlendedNeighborWeights(neighborTerrains, random());
}

function chooseWeightedTerrain(sourceTerrain: TerrainKey, roll: number): TerrainKey {
  const probabilities = transitionProbabilities.probabilities[sourceTerrain];
  return chooseFromWeights(probabilities, roll);
}

function chooseByWeightedNeighborVote(
  neighborTerrains: TerrainKey[],
  random: () => number,
): TerrainKey {
  const votes = createEmptyTerrainWeights();

  for (const neighborTerrain of neighborTerrains) {
    const vote = chooseWeightedTerrain(neighborTerrain, random());
    votes[vote] += 1;
  }

  return chooseFromWeights(votes, random());
}

function chooseByBlendedNeighborWeights(
  neighborTerrains: TerrainKey[],
  roll: number,
): TerrainKey {
  const blendedWeights = createEmptyTerrainWeights();

  for (const neighborTerrain of neighborTerrains) {
    const probabilities = transitionProbabilities.probabilities[neighborTerrain];

    for (const terrainKey of Object.keys(probabilities) as TerrainKey[]) {
      blendedWeights[terrainKey] += probabilities[terrainKey];
    }
  }

  return chooseFromWeights(blendedWeights, roll);
}

function chooseFromWeights(weights: Record<TerrainKey, number>, roll: number): TerrainKey {
  const totalWeight = Object.values(weights).reduce(
    (runningTotal, weight) => runningTotal + weight,
    0,
  );
  const target = roll * totalWeight;
  let runningTotal = 0;

  for (const terrainKey of Object.keys(weights) as TerrainKey[]) {
    runningTotal += weights[terrainKey];
    if (target <= runningTotal) {
      return terrainKey;
    }
  }

  return "grass";
}

function getKnownNeighborTerrains(
  x: number,
  y: number,
  terrainGrid: TerrainKey[][],
): TerrainKey[] {
  const neighbors: TerrainKey[] = [];

  for (const offsetY of [-1, 0]) {
    for (const offsetX of [-1, 0, 1]) {
      if (offsetX === 0 && offsetY === 0) {
        continue;
      }

      const neighborY = y + offsetY;
      const neighborX = x + offsetX;
      const terrain = terrainGrid[neighborY]?.[neighborX];

      if (terrain) {
        neighbors.push(terrain);
      }
    }
  }

  return neighbors;
}

function createEmptyTerrainWeights(): Record<TerrainKey, number> {
  return {
    grass: 0,
    dirt: 0,
    mud: 0,
    water: 0,
    sand: 0,
  };
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
