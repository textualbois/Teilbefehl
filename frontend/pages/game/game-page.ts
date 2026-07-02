import type { MapCreateResponseMessage } from "../../api/proto";
import { renderMap } from "../../game/render/render-map";
import { createElement } from "../../ui/dom";
import "./game-page.css";

type GamePageOptions = {
  map: MapCreateResponseMessage;
  onBackToLobby: () => void;
};

export function renderGamePage(options: GamePageOptions): HTMLElement {
  const panel = createElement("div", { className: "panel game-panel" });
  const dimensions = options.map.mapDimensions;

  panel.append(createElement("p", { className: "eyebrow", text: "Generated Map" }));
  panel.append(createElement("h2", { text: "Game Map" }));
  panel.append(
    createElement("p", {
      text: `${dimensions?.width ?? 0} x ${dimensions?.height ?? 0} | seed: ${options.map.seed}`,
    }),
  );
  panel.append(renderMap(options.map));
  panel.append(renderActions(options));

  return panel;
}

function renderActions(options: GamePageOptions): HTMLElement {
  const actions = createElement("div", { className: "actions" });
  const backButton = createElement("button", {
    className: "button secondary",
    text: "Back to Lobby",
  }) as HTMLButtonElement;

  backButton.type = "button";
  backButton.addEventListener("click", options.onBackToLobby);

  actions.append(backButton);
  return actions;
}
