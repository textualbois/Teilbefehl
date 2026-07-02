import { generateMap } from "../../game/map/generate-map";
import {
  MapCreateRequest,
  MapDimensions,
  MapGenerationStrategy,
} from "../../game/generated/proto/common_definitions/map_2d_message";
import type {
  MapCreateRequest as MapCreateRequestMessage,
  MapCreateResponse as MapCreateResponseMessage,
} from "../../game/generated/proto/common_definitions/map_2d_message";

export type { MapCreateRequestMessage, MapCreateResponseMessage };
export { MapGenerationStrategy };

export type MapCreateOptions = {
  width: number;
  height: number;
  seed?: string;
  generationStrategy?: MapGenerationStrategy;
};

export type Map2DProtoApi = {
  createMap: (request: MapCreateRequestMessage) => Promise<MapCreateResponseMessage>;
};

export function createMapCreateRequest(options: MapCreateOptions): MapCreateRequestMessage {
  return MapCreateRequest.create({
    mapDimensions: MapDimensions.create({
      width: options.width,
      height: options.height,
    }),
    seed: options.seed,
    generationStrategy:
      options.generationStrategy ?? MapGenerationStrategy.BLENDED_NEIGHBOR_WEIGHTS,
  });
}

export function createMap2DProtoApi(): Map2DProtoApi {
  return {
    async createMap(request) {
      // TODO(backend): Replace this local generator call with Map2DServiceClient
      // over a real transport when the backend map service exists.
      return generateMap(request);
    },
  };
}
