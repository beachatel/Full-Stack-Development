import { menuBtn } from "./ui_components/menuBtn";
import { menuPanel } from "./ui_components/menuPanel";

export function initTitleBar() {
  const titleDiv = document.createElement("div");
  titleDiv.id = "title-div";
  const h1 = document.createElement("h1");

  h1.textContent = "Module Based Website";

  const createMenuBtn = menuBtn();
  const createMenuPanel = menuPanel();
  menuPanel.id = "menu-panel";

  titleDiv.appendChild(createMenuBtn);
  titleDiv.appendChild(h1);
  titleDiv.appendChild(createMenuPanel);

  return titleDiv;
}
