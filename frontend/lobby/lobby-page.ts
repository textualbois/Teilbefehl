import { createElement } from "../ui/dom";
import "./lobby-page.css";

type SelectOption = {
  label: string;
  value: string;
};

type LobbyPageOptions = {
  onBack: () => void;
};

const mapSizeOptions: SelectOption[] = [
  { label: "Small - 32 x 32", value: "small" },
  { label: "Medium - 64 x 64", value: "medium" },
  { label: "Large - 128 x 128", value: "large" },
];

export function renderLobbyPage(options: LobbyPageOptions): HTMLElement {
  const panel = createElement("div", { className: "panel" });

  panel.append(createElement("p", { className: "eyebrow", text: "New Lobby" }));
  panel.append(createElement("h2", { text: "Create Lobby" }));
  panel.append(renderLobbyForm());
  panel.append(
    createElement("div", {
      className: "lobby-summary",
      text: "Lobby setup only for now. Backend wiring can come after the map exists.",
    }),
  );
  panel.append(renderActions(options));

  return panel;
}

function renderLobbyForm(): HTMLFormElement {
  const form = createElement("form", { className: "lobby-form" }) as HTMLFormElement;

  form.append(renderSeedField());
  form.append(renderMapSizeField());

  return form;
}

function renderSeedField(): HTMLElement {
  const wrapper = createElement("div", { className: "lobby-field" });
  const label = createElement("label", { text: "Seed Game" }) as HTMLLabelElement;
  const input = createElement("input") as HTMLInputElement;

  label.htmlFor = "game-seed";
  input.id = "game-seed";
  input.name = "game-seed";
  input.value = "first-camp";

  wrapper.append(label, input);
  return wrapper;
}

function renderMapSizeField(): HTMLElement {
  const wrapper = createElement("div", { className: "lobby-field" });
  const label = createElement("label", { text: "Map Size" }) as HTMLLabelElement;
  const select = createElement("select") as HTMLSelectElement;

  label.htmlFor = "map-size";
  select.id = "map-size";
  select.name = "map-size";

  for (const optionConfig of mapSizeOptions) {
    const option = createElement("option", { text: optionConfig.label }) as HTMLOptionElement;
    option.value = optionConfig.value;
    option.selected = optionConfig.value === "medium";
    select.append(option);
  }

  wrapper.append(label, select);
  return wrapper;
}

function renderActions(options: LobbyPageOptions): HTMLElement {
  const actions = createElement("div", { className: "actions" });
  const backButton = createElement("button", {
    className: "button secondary",
    text: "Back",
  }) as HTMLButtonElement;

  backButton.type = "button";
  backButton.addEventListener("click", options.onBack);

  actions.append(backButton);
  return actions;
}
