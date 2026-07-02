import type { MapCreateResponseMessage } from "../api/proto";
import { renderGamePage } from "../pages/game/game-page";
import { renderLobbyPage } from "../pages/lobby/lobby-page";
import { renderStartPage } from "../pages/start/start-page";
import { createElement } from "../ui/dom";

type Page = "start" | "lobby" | "game";

type Router = {
  render: () => void;
};

export function createRouter(appRoot: HTMLElement): Router {
  let currentPage: Page = "start";
  let currentMap: MapCreateResponseMessage | undefined;

  function render(): void {
    if (currentPage === "game" && currentMap) {
      appRoot.replaceChildren(
        renderShell(
          renderGamePage({
            map: currentMap,
            onBackToLobby: () => {
              currentPage = "lobby";
              render();
            },
          }),
        ),
      );
      return;
    }

    if (currentPage === "lobby") {
      appRoot.replaceChildren(
        renderShell(
          renderLobbyPage({
            onBack: () => {
              currentPage = "start";
              render();
            },
            onMapCreated: (map) => {
              currentMap = map;
              currentPage = "game";
              render();
            },
          }),
        ),
      );
      return;
    }

    appRoot.replaceChildren(
      renderShell(
        renderStartPage({
          onCreateLobby: () => {
            currentPage = "lobby";
            render();
          },
        }),
      ),
    );
  }

  return { render };
}

function renderShell(content: HTMLElement): HTMLElement {
  const shell = createElement("section", { className: "shell" });
  shell.append(content);
  return shell;
}
