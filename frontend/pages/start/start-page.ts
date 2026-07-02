import { createElement } from "../../ui/dom";
import "./start-page.css";

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

type StartPageOptions = {
  onCreateLobby: () => void;
};

export function renderStartPage(options: StartPageOptions): HTMLElement {
  return renderStartPanel(getStartPanelConfig(options));
}

function getStartPanelConfig(options: StartPageOptions): PanelConfig {
  return {
    eyebrow: "Command Room",
    title: "Strategy Game",
    titleLevel: 1,
    description:
      "Build a world, issue orders, and try to keep the whole machine alive long enough for the map to matter.",
    buttons: [
      {
        label: "Create Lobby",
        action: options.onCreateLobby,
      },
    ],
  };
}

function renderStartPanel(config: PanelConfig): HTMLElement {
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
