import { menu } from "./ui_components/menu.js";
import "./titleBar.css";

export function initTitleBar({ title, searchBar = {}, menuConfig = {} }) {
  const titleDiv = document.createElement("div");
  titleDiv.id = "title-div";

  const h1 = document.createElement("h1");
  h1.textContent = title;

  const { menuBtn, menuPanel } = menu({ menuConfig });
  console.log(menuConfig);
  titleDiv.appendChild(h1);
  titleDiv.appendChild(menuBtn);
  titleDiv.appendChild(menuPanel);

  return titleDiv;
}
