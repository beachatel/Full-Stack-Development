export function menuPanel() {
  const menuPanel = document.createElement("div");
  menuPanel.innerHTML = "menu panel";
  menuPanel.id = "menu-panel";
  menuPanel.style.display = "none";

  return menuPanel;
}
