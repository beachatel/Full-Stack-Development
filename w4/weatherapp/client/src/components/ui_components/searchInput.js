import { searchButton } from "./searchButton";

function searchButtonHandler() {}

export function searchInput() {
  const container = document.createElement("div");
  container.id = "search-container";
  const search = document.createElement("input");
  search.type = "text";
  search.placeholder = "Enter a town or city";
  search.id = "search-input";

  const button = searchButton(searchButtonHandler);
  container.appendChild(search);
  container.appendChild(button);

  return container;
}
