import "./menu.css";

function handleClick(event) {
  const menuBtn = event.currentTarget;
  const isHamburger = menuBtn.textContent === "\u2630";
  menuBtn.textContent = isHamburger ? "\u2715" : "\u2630";

  const menu = document.getElementById("menu-panel");
  menu.style.display = isHamburger ? "block" : "none";
}

export function menu({ menuConfig }) {
  const menuBtn = document.createElement("div");
  menuBtn.id = "menu-btn";

  menuBtn.textContent = menuConfig.menuIcon;
  menuBtn.addEventListener("click", handleClick);

  const menuPanel = document.createElement("div");
  menuPanel.id = "menu-panel";
  menuPanel.className = menuConfig.menuStyle;
  menuPanel.style.display = "none";

  for (let item of menuConfig.menuItems) {
    const menuItem = document.createElement("a");
    menuItem.className = "menu-item";
    menuItem.href = item.href;
    menuItem.textContent = item.text;
    menuPanel.appendChild(menuItem);
  }

  return { menuBtn, menuPanel };
}
