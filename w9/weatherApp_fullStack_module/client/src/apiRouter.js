import { dailyForecast } from "./components/ui_components/weatherTile.js";

export async function weatherApi(placename) {
  const url = `/weather?placename=${placename}`;
  const response = await fetch(url);
  const data = await response.json();

  return data;
  // dailyForecast(data.current, data.daily);
}

export async function addFavourite(placename) {
  const url = "/addFavourite";

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ placename }),
  });

  const data = await response.json();

  return data;
}

export async function getFavourites() {
  const url = "/getFavourites";
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
