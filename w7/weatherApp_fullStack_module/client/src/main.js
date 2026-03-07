import { initTitleBar } from "./components/titleBar.js";
import { searchInput } from "./components/ui_components/searchInput.js";
import { weatherApi } from "./apiRouter.js";
import "./style.css";

function initApp() {
  const app = document.getElementById("app");

  // Title Bar Configuration with props
  const props = {
    title: "title",
    menuConfig: {
      menuIcon: "\u2630",
      menuStyle: "small",
      menuItems: [
        { text: "About", href: "about" },
        { text: "Contact", href: "contact" },
        { text: "Services", href: "services" },
        { text: "Settings", href: "settings" },
      ],
    },
  };
  const titleBar = initTitleBar(props);

  const contentDiv = document.createElement("div");
  contentDiv.id = "content-div";

  const search = searchInput({
    placeholder: "Enter town or city...",
    onInputKeyPress: handleKeyInput,
    onButtonClick: handleButtonClick,
  });

  contentDiv.appendChild(search);

  app.appendChild(titleBar);
  app.appendChild(contentDiv);
}

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

const handleKeyInput = (event, inputElement) => {
  if (event.key === "Enter") {
    const query = inputElement.value.trim();
    console.log(query);
    weatherApi(query);
    inputElement.value = "";
  }
};

const handleButtonClick = (event, inputElement) => {
  const query = inputElement.value.trim();
  console.log(query);
  weatherApi(query);
  inputElement.value = "";
};
