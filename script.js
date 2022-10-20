const API_KEY = "569cffb67a9a40ddac1ae92901b5f92c";

const getCurrentWeatherData = async() => {
    const city = "kolkata";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    return response.json();
}

const getHourlyForecast = async({name: city}) => {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`);
  const data = await response.json();
  return data.list.map(forecast =>{
    const { main: {temp, temp_max, temp_min}, dt, dt_txt, weather: [{description, icon}] } = forecast;
    return {temp, temp_max, temp_min, dt, dt_txt, description, icon}
  })
}


const formatTemperature = (temp) => `${temp?.toFixed(1)}°`;
const createUrl = (icon) => `https://openweathermap.org/img/wn/${icon}02x.png`

loadCurrentForecast = ({name, main: {temp, temp_max, temp_min}, weather:[{description}] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemperature(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemperature(temp_max)} L: ${formatTemperature(temp_min)}`;

}

const loadHourlyForecast = (hourlyForecast) =>{
 console.log(hourlyForecast);
 let dataForTwelveHours = hourlyForecast.slice(1, 12);
 const hourlyContainer = document.querySelector(".hourly-container");
 let innerHmtlString = "";

 for(let {temp, icon, dt_txt} of dataForTwelveHours) {
  innerHmtlString += `<article>
  <h3 class="time">${dt_txt.split(" ")[1]}</h3>
  <img class="icon" src="${createUrl(icon)}" />
  <p class="hourly-temp">${formatTemperature(temp)}</p>
</article>`
 }
 hourlyContainer.innerHTML = innerHmtlString

}

const loadFeelsLike = ({main: {feels_like}}) => {
  const container = document.querySelector("#feels-like");
  container.querySelector(".feels-like-temp").textContent = formatTemperature(feels_like);
}
const loadHumidity = ({main: {humidity}}) => {
  const container = document.querySelector("#humidity");
  container.querySelector(".humidity-value").textContent = `${humidity} %`;
}

document.addEventListener("DOMContentLoaded", async()=> {
  const currentWeather = await getCurrentWeatherData();
  loadCurrentForecast(currentWeather);
  const hourlyForecast = await getHourlyForecast(currentWeather);
  loadHourlyForecast(hourlyForecast);
loadFeelsLike(currentWeather);
loadHumidity(currentWeather);
})