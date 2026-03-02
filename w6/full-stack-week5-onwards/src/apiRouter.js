import { hourlyForecast } from "./components/ui_components/weatherTile.js";
import { weeklyForecast } from "./components/ui_components/weatherTile.js";

const apiKey = "b7888b07411ce564248053345ab0dbdd";

export async function geocoding(placename) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${placename}&limit=1&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    const { lat, lon } = data[0];
    getWeatherData(lat, lon);
  } catch {}
}

async function getWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  await hourlyForecast(data);
  await weeklyForecast(data);
}
