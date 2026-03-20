import { initTitleBar } from "./components/ui_components/titleBar.js";
import { searchInput } from "./components/ui_components/searchInput.js";
import { weatherApi, addFavourite, getFavourites } from "./apiRouter.js";
import { dailyForecast } from "./components/ui_components/weatherTile.js";
import { favButton } from "./components/ui_components/favButton.js";
import "./style.css";

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

  const favBtn = favButton({ onButtonClick: handleFavClick });

  app.appendChild(titleBar);
  app.appendChild(contentDiv);
  contentDiv.appendChild(search);
  contentDiv.appendChild(favBtn);
}

// Wait for DOM load so `#app` exists before mounting components.
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

const handleKeyInput = (event, inputElement) => {
  // Submit the search when the user presses Enter in the input.
  if (event.key === "Enter") {
    handleButtonClick(event, inputElement);
  }
};

const handleButtonClick = async (event, inputElement) => {
  // Submit the search when the search button is clicked.
  const query = inputElement.value.trim();
  console.log(query);
  // geocoding(query);

  const data = await weatherApi(query);
  console.log(data);
  dailyForecast(data.name, data.weather.current, data.weather.daily);

  inputElement.value = "";
};

const handleFavClick = async (event) => {
  const placenameEl = document.getElementById("placename");
  const placename = placenameEl.textContent;

  const { data } = await getFavourites();

  for (let i = 0; i < data.length; i++) {
    if (placename === data[i].placename) {
      console.log("duplicate", placename);
      return;
    }
  }

  console.log(data);

  await addFavourite(placename);
};
