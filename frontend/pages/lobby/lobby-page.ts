import {
  createMap2DProtoApi,
  createMapCreateRequest,
  MapGenerationStrategy,
  type MapCreateResponseMessage,
} from "../../api/proto";
import { createElement } from "../../ui/dom";
import "./lobby-page.css";

type MapSizeOption = {
  label: string;
  value: string;
  width: number;
  height: number;
};

type GenerationStrategyOption = {
  label: string;
  value: string;
  strategy: MapGenerationStrategy;
};

type LobbyPageOptions = {
  onBack: () => void;
  onMapCreated: (map: MapCreateResponseMessage) => void;
};

const mapSizeOptions: MapSizeOption[] = [
  { label: "Small - 128 x 128", value: "small", width: 128, height: 128 },
  { label: "Medium - 256 x 256", value: "medium", width: 256, height: 256 },
  { label: "Large - 512 x 512", value: "large", width: 512, height: 512 },
];

const generationStrategyOptions: GenerationStrategyOption[] = [
  {
    label: "Blended Neighbor Weights",
    value: "blended-neighbor-weights",
    strategy: MapGenerationStrategy.BLENDED_NEIGHBOR_WEIGHTS,
  },
  {
    label: "Weighted Neighbor Vote",
    value: "weighted-neighbor-vote",
    strategy: MapGenerationStrategy.WEIGHTED_NEIGHBOR_VOTE,
  },
];

const mapApi = createMap2DProtoApi();

export function renderLobbyPage(options: LobbyPageOptions): HTMLElement {
  const panel = createElement("div", { className: "panel" });

  panel.append(createElement("p", { className: "eyebrow", text: "New Lobby" }));
  panel.append(createElement("h2", { text: "Create Lobby" }));
  const form = renderLobbyForm(options);

  panel.append(form);
  panel.append(
    createElement("div", {
      className: "lobby-summary",
      text: "Lobby setup only for now. Backend wiring can come after the map exists.",
    }),
  );

  return panel;
}

function renderLobbyForm(options: LobbyPageOptions): HTMLFormElement {
  const form = createElement("form", { className: "lobby-form" }) as HTMLFormElement;

  form.append(renderSeedField());
  form.append(renderMapSizeField());
  form.append(renderGenerationStrategyField());
  form.append(renderActions(options));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void createMapFromForm(form, options);
  });

  return form;
}

function renderGenerationStrategyField(): HTMLElement {
  const wrapper = createElement("div", { className: "lobby-field" });
  const label = createElement("label", { text: "Generation Method" }) as HTMLLabelElement;
  const select = createElement("select") as HTMLSelectElement;

  label.htmlFor = "generation-strategy";
  select.id = "generation-strategy";
  select.name = "generation-strategy";

  for (const optionConfig of generationStrategyOptions) {
    const option = createElement("option", { text: optionConfig.label }) as HTMLOptionElement;
    option.value = optionConfig.value;
    option.selected = optionConfig.strategy === MapGenerationStrategy.BLENDED_NEIGHBOR_WEIGHTS;
    select.append(option);
  }

  wrapper.append(label, select);
  return wrapper;
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
  const createButton = createElement("button", {
    className: "button",
    text: "Generate Map",
  }) as HTMLButtonElement;
  const backButton = createElement("button", {
    className: "button secondary",
    text: "Back",
  }) as HTMLButtonElement;

  createButton.type = "submit";
  backButton.type = "button";
  backButton.addEventListener("click", options.onBack);

  actions.append(createButton, backButton);
  return actions;
}

async function createMapFromForm(
  form: HTMLFormElement,
  options: LobbyPageOptions,
): Promise<void> {
  const formData = new FormData(form);
  const seed = String(formData.get("game-seed") ?? "");
  const mapSize = getMapSize(String(formData.get("map-size") ?? "medium"));
  const generationStrategy = getGenerationStrategy(
    String(formData.get("generation-strategy") ?? "blended-neighbor-weights"),
  );
  const request = createMapCreateRequest({
    width: mapSize.width,
    height: mapSize.height,
    seed,
    generationStrategy: generationStrategy.strategy,
  });
  const response = await mapApi.createMap(request);

  options.onMapCreated(response);
}

function getMapSize(value: string): MapSizeOption {
  return (
    mapSizeOptions.find((optionConfig) => optionConfig.value === value) ??
    mapSizeOptions[1]
  );
}

function getGenerationStrategy(value: string): GenerationStrategyOption {
  return (
    generationStrategyOptions.find((optionConfig) => optionConfig.value === value) ??
    generationStrategyOptions[0]
  );
}
