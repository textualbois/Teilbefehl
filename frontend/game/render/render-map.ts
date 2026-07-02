import { TerrainType } from "../generated/proto/common_definitions/common";
import type { MapCreateResponseMessage } from "../../api/proto";
import { createElement } from "../../ui/dom";
import "./render-map.css";

const terrainClassByType: Record<TerrainType, string> = {
  [TerrainType.UNSPECIFIED]: "terrain-unspecified",
  [TerrainType.GRASS]: "terrain-grass",
  [TerrainType.DIRT]: "terrain-dirt",
  [TerrainType.MUD]: "terrain-mud",
  [TerrainType.WATER]: "terrain-water",
  [TerrainType.SAND]: "terrain-sand",
};

export function renderMap(map: MapCreateResponseMessage): HTMLElement {
  const mapWrapper = createElement("div", { className: "map-render" });
  const dimensions = map.mapDimensions;

  if (!dimensions || dimensions.width === 0 || dimensions.height === 0) {
    mapWrapper.append(createElement("p", { text: "No map tiles generated." }));
    return mapWrapper;
  }

  mapWrapper.style.setProperty("--map-width", String(dimensions.width));

  for (const tile of getTilesInRenderOrder(map)) {
    const terrainType = tile.properties?.terrainType ?? TerrainType.UNSPECIFIED;
    const coordinates = tile.properties?.coordinates;
    const tileElement = createElement("div", {
      className: `map-tile ${terrainClassByType[terrainType]}`,
    });

    tileElement.title = `${tile.name} (${coordinates?.x ?? "?"}, ${coordinates?.y ?? "?"})`;
    mapWrapper.append(tileElement);
  }

  return mapWrapper;
}

function getTilesInRenderOrder(map: MapCreateResponseMessage) {
  return [...map.tiles].sort((left, right) => {
    const leftCoordinates = left.properties?.coordinates;
    const rightCoordinates = right.properties?.coordinates;

    if ((leftCoordinates?.y ?? 0) !== (rightCoordinates?.y ?? 0)) {
      return (leftCoordinates?.y ?? 0) - (rightCoordinates?.y ?? 0);
    }

    return (leftCoordinates?.x ?? 0) - (rightCoordinates?.x ?? 0);
  });
}
