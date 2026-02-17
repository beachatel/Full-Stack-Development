import { menuPanel } from "./menuPanel";

function onClick(event) {
  const menuBtn = event.currentTarget;

  const isMenuBtnClicked = menuBtn.textContent === "\u2630";
  menuBtn.textContent = isMenuBtnClicked ? "\u2715" : "\u2630";
  // ternary statment. if else statmenet if menuBtnClicked is true(displays x)
  //  and if it false bc the menuBtn is displayed then display hamburger

  const menuPanel = document.getElementById("menu-panel");
  menuPanel.style.display = isMenuBtnClicked ? "block" : "none";
}

export function menuBtn() {
  const menuBtn = document.createElement("div");
  menuBtn.id = "menu-btn";
  menuBtn.textContent = "\u2630";
  menuBtn.addEventListener("click", onClick);
  return menuBtn;
}
