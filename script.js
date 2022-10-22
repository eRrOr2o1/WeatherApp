const API_KEY = "569cffb67a9a40ddac1ae92901b5f92c";

const DAYS_OF_THE_WEEK = ['sun', 'mon', 'tue', 'wed', 'thus', 'fri', 'sat'];

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
const createUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

const loadCurrentForecast = ({name, main: {temp, temp_max, temp_min}, weather:[{description}] }) => {
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemperature(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemperature(temp_max)} L: ${formatTemperature(temp_min)}`;

}

const loadHourlyForecast = ({main: {temp: tempNow}, weather: [{icon: iconNow}]}, hourlyForecast) =>{
const timeFormater = Intl.DateTimeFormat("en", {
  hour12:true, hour:"numeric"
 })
 let dataForTwelveHours = hourlyForecast.slice(2, 14);
 const hourlyContainer = document.querySelector(".hourly-container");
 let innerHmtlString = `<article>
 <h3 class="time">Now</h3>
 <img class="icon" src="${createUrl(iconNow)}" />
 <p class="hourly-temp">${formatTemperature(tempNow)}</p>
</article>`;

 for(let {temp, icon, dt_txt} of dataForTwelveHours) {
  
  innerHmtlString += `<article>
  <h3 class="time">${timeFormater.format(new Date(dt_txt))}</h3>
  <img class="icon" src="${createUrl(icon)}" />
  <p class="hourly-temp">${formatTemperature(temp)}</p>
</article>`;
 }
 hourlyContainer.innerHTML = innerHmtlString

}

const calculateDayWiseForecast = (hourlyForecast) => {
  let dayWiseForecast = new Map();
  for(let forecast of hourlyForecast) {
    const [date] = forecast.dt_txt.split(" ");
    const dayOfTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];
    console.log(dayOfTheWeek);
    if(dayWiseForecast.has(dayOfTheWeek)) {
       let forecastForTheDay = dayWiseForecast.get(dayOfTheWeek);
       forecastForTheDay.push(forecast);
       dayWiseForecast.set(dayOfTheWeek, forecastForTheDay);
    } else {
      dayWiseForecast.set(dayOfTheWeek, [forecast])
    }
  }
  console.log(dayWiseForecast);
  for(let [key, value] of dayWiseForecast) {
    let temp_min = Math.min(...Array.from(value, val => val.temp_min));
    let temp_max = Math.max(...Array.from(value, val => val.temp_max));

    dayWiseForecast.set(key, {temp_min, temp_max, icon: value.find(v => v.icon).icon})

  }
  console.log(dayWiseForecast)
  return dayWiseForecast;
}



const loadFiveDayForecast = (hourlyForecast) => {
  const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);
  const container = document.querySelector(".five-day-forecast-container");
  let dayWiseInfo = "";
  Array.from(dayWiseForecast).map(([day, {temp_max, temp_min, icon}],index) => {
  if(index < 5){

    dayWiseInfo +=  `<article class="day-wise-forecast">
    <h3 class="day">${index ===0? "today": day}</h3>
    <img class="icon" src="${createUrl(icon)}" alt="">
    <p class="min-temp">${formatTemperature(temp_min)}</p>
    <p class="max-temp">${formatTemperature(temp_max)}</p>
    </article>`;
  }
  });
  container.innerHTML = dayWiseInfo;
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
  loadHourlyForecast(currentWeather, hourlyForecast);
  loadFiveDayForecast(hourlyForecast)
loadFeelsLike(currentWeather);
loadHumidity(currentWeather);
})