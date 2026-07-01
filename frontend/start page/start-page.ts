import { renderLobbyPage } from "../lobby/lobby-page";
import { createElement } from "../ui/dom";
import "./start-page.css";

type Page = "start" | "lobby";

type ButtonVariant = "primary" | "secondary";

type ButtonConfig = {
  label: string;
  action: () => void;
  variant?: ButtonVariant;
};

type PanelConfig = {
  eyebrow: string;
  title: string;
  titleLevel: 1 | 2;
  description?: string;
  buttons: ButtonConfig[];
};

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("App root not found.");
}

const app = appRoot;

let currentPage: Page = "start";

function render(): void {
  if (currentPage === "lobby") {
    app.replaceChildren(
      renderShell(
        renderLobbyPage({
          onBack: () => {
            currentPage = "start";
            render();
          },
        }),
      ),
    );
    return;
  }

  app.replaceChildren(renderShell(renderStartPanel()));
}

function getStartPanelConfig(): PanelConfig {
  return {
    eyebrow: "Command Room",
    title: "Strategy Game",
    titleLevel: 1,
    description:
      "Build a world, issue orders, and try to keep the whole machine alive long enough for the map to matter.",
    buttons: [
      {
        label: "Create Lobby",
        action: () => {
          currentPage = "lobby";
          render();
        },
      },
    ],
  };
}

function renderShell(content: HTMLElement): HTMLElement {
  const shell = createElement("section", { className: "shell" });
  shell.append(content);
  return shell;
}

function renderStartPanel(): HTMLElement {
  const config = getStartPanelConfig();
  const panel = createElement("div", { className: "panel" });

  panel.append(createElement("p", { className: "eyebrow", text: config.eyebrow }));
  panel.append(createElement(`h${config.titleLevel}`, { text: config.title }));

  if (config.description) {
    panel.append(createElement("p", { text: config.description }));
  }

  panel.append(renderActions(config.buttons));

  return panel;
}

function renderActions(buttons: ButtonConfig[]): HTMLElement {
  const actions = createElement("div", { className: "actions" });

  for (const buttonConfig of buttons) {
    const button = createElement("button", {
      className:
        buttonConfig.variant === "secondary" ? "button secondary" : "button",
      text: buttonConfig.label,
    }) as HTMLButtonElement;
    button.type = "button";
    button.addEventListener("click", buttonConfig.action);
    actions.append(button);
  }

  return actions;
}

render();
