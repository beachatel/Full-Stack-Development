import { initTitleBar } from "./components/ui_components/titleBar.js";
import { searchInput } from "./components/ui_components/searchInput.js";
import { weatherApi } from "./apiRouter.js";
import "./style.css";
import { dailyForecast } from "./components/ui_components/weatherTile.js";

// Build the static page shell once the app container is available.
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

// Wait for DOM load so `#app` exists before mounting components.
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

const handleKeyInput = async (event, inputElement) => {
  // Submit the search when the user presses Enter in the input.
  if (event.key === "Enter") {
    await handleButtonClick(event, inputElement);
  }
};

const handleButtonClick = async (event, inputElement) => {
  // Submit the search when the search button is clicked.
  const query = inputElement.value.trim();

  // geocoding(query);
  const weather = await weatherApi(query);
  console.log(weather);
  dailyForecast(weather.current, weather.daily);
  inputElement.value = "";
};
