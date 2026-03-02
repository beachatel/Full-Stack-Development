function weatherTile(tempData) {
  const weatherTileDiv = document.createElement("div");
  weatherTileDiv.class = "weather-tile-div";

  const temp = document.createElement("div");
  temp.innerHTML = "max: " + tempData[0] + "ºC " + "min: " + tempData[1];
  temp.class = "current-temp";

  weatherTileDiv.appendChild(temp);

  return weatherTileDiv;
}

export async function weeklyForecast(dailyData) {
  const contentDiv = document.getElementById("content-area");
  const dailyContainer = document.createElement("div");
  dailyContainer.id = "daily-container";
  const dailyExisting = document.getElementById("daily-container");

  if (dailyExisting) {
    contentDiv.removeChild(dailyExisting);
  }

  for (const day of dailyData.daily) {
    const dailyInfo = weatherTile([day.temp.max, day.temp.min]);
    dailyInfo.id = "daily-info";

    dailyContainer.appendChild(dailyInfo);
  }
  const contentArea = document.getElementById("content-area");
  contentArea.appendChild(dailyContainer);
}

export async function hourlyForecast(hourlyData) {
  const contentDiv = document.getElementById("content-area");
  const hourlyExisting = document.getElementById("hourly-container");

  if (hourlyExisting) {
    contentDiv.removeChild(hourlyExisting);
  }

  const hourlyContainer = document.createElement("div");
  hourlyContainer.id = "hourly-container";

  console.log(hourlyData.hourly.temp);

  for (const hour of hourlyData.hourly) {
    const hourlyInfo = weatherTile(hour.temp);
    hourlyContainer.appendChild(hourlyInfo);
  }
  const contentArea = document.getElementById("content-area");
  contentArea.appendChild(hourlyContainer);
}
