import { initTitleBar } from "./components/titleBar.js";
import { searchInput } from "./components/ui_components/searchInput.js";

function initApp() {
  const app = document.getElementById("app");
  const titleBar = initTitleBar();
  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = "";
  const search = searchInput();

  app.appendChild(titleBar);
  contentDiv.appendChild(search);
  app.appendChild(contentDiv);
}

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});
