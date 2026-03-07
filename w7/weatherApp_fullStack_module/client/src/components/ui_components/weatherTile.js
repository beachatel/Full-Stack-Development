import "./weatherTile.css";

export function weatherTile(temp, summaryText, icon) {
  const weatherTileDiv = document.createElement("div");
  weatherTileDiv.className = "weather-tile-div";

  const tempDiv = document.createElement("div");
  tempDiv.className = "current-temp";
  tempDiv.innerHTML = temp + "ºC";

  const summary = document.createElement("div");
  summary.innerHTML = summaryText;

  const iconImg = document.createElement("img");
  iconImg.src = `https://openweathermap.org/payload/api/media/file/${icon}.png`;

  weatherTileDiv.appendChild(tempDiv);

  weatherTileDiv.appendChild(iconImg);
  weatherTileDiv.appendChild(summary);
  return weatherTileDiv;
}

export function dailyForecast(currentData, dailyData) {
  const contentDiv = document.getElementById("content-div");
  const dailyExisting = document.getElementById("daily-container");

  if (dailyExisting) {
    contentDiv.removeChild(dailyExisting);
  }
  const dailyContainer = document.createElement("div");
  dailyContainer.id = "daily-container";

  for (let i = 0; i < dailyData.length; i++) {
    const tile = weatherTile(
      dailyData[i].temp.max,
      dailyData[i].summary,
      dailyData[i].weather[0].icon,
    );
    dailyContainer.appendChild(tile);
  }

  contentDiv.appendChild(dailyContainer);
}
