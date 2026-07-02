import { createRouter } from "./router";

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("App root not found.");
}

createRouter(appRoot).render();
