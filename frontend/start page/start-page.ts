const app = document.querySelector<HTMLElement>("#app");

if (!app) {
  throw new Error("App root not found.");
}

app.innerHTML = `
  <section>
    <h1>Strategy Game</h1>
    <p>Start page</p>
  </section>
`;
