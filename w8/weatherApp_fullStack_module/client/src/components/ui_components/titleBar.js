import { menu } from "./menu.js";
import "./titleBar.css";

// Compose the title bar and attach the configurable menu controls.
export function initTitleBar({ title, searchBar = {}, menuConfig = {} }) {
  const titleDiv = document.createElement("div");
  titleDiv.id = "title-div";

  const h1 = document.createElement("h1");
  h1.textContent = title;

  const { menuBtn, menuPanel } = menu({ menuConfig });

  titleDiv.appendChild(h1);
  titleDiv.appendChild(menuBtn);
  titleDiv.appendChild(menuPanel);

  return titleDiv;
}
