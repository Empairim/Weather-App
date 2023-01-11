let searchInp = document.querySelector('.weather_search');
let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_indicator-humidity>.value');
let wind = document.querySelector('.weather_indicator-wind>.value');
let pressure = document.querySelector('.weather_indicator-pressure>.value');
let image = document.querySelector('.weather_image');
let temperature = document.querySelector('.weather_temperature');
let forecastBlock = document.querySelector('.weather_forecast');
let weatherAPIKey = 'dd00edb30f462769de19a9a16beae198';
let weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=' + weatherAPIKey;
let forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=imperial&appid='+ weatherAPIKey
let geocodingBaseEndpoint = 'http://api.openweathermap.org/geo/1.0/direct?&limit=5&appid='+weatherAPIKey+'&q=';
let datalist = document.getElementById('suggestions');

let weatherImages = [
    {
        url: 'images/clear-sky.png',
        ids: [800]
    },
    {
        url: 'images/broken-clouds.png',
        ids: [803, 804]
    },
    {
        url: 'images/few-clouds.png',
        ids: [801]
    },
    {
        url: 'images/mist.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 771, 781]
    },
    {
        url: 'images/rain.png',
        ids: [500, 501, 502, 503, 504]
    },
    {
        url: 'images/scattered-clouds.png',
        ids: [802]
    },
    {
        url: 'images/shower-rain.png',
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321]
    },
    {
        url: 'images/snow.png',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620 ,620, 622]
    },
    {
        url: 'images/thunderstorm.png',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    }
]
// so the unqiue key is tied to the api site, also >. to add it to the value in the humid wind and pressure //

let getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndpoint + '&q=' + city
    let response = await fetch(endpoint);
    let weather = await response.json();
    console.log(weather);
    return weather;
}

let getForecastByCityId = async(id) => {
    let endpoint = forecastBaseEndpoint + '&id=' + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();
        if (hours === 12) {
            daily.push(day);
        }
    });
    return daily;
}

let weatherForCity = async (city) => {
    let weather = await getWeatherByCityName(city);
    if(weather.cod === '404'){
        return;
    };
    let cityID = weather.id;
    updateCurrentWeather(weather);
    let forecast = await getForecastByCityId(cityID);
    updateForecast(forecast);
}

searchInp.addEventListener('keydown', async (e) => {
    if(e.keyCode === 13) {
        weatherForCity(searchInp.value);
    
    }
})
searchInp.addEventListener('input', async () => {
    if (searchInp.value.length <= 2) {
        return;
    }
    let endpoint = geocodingBaseEndpoint + searchInp.value;
    let result = await (await fetch(endpoint)).json();
    datalist.innerHTML = '';
    result.forEach((city) => {
        let option = document.createElement('option');
        option.value = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
        datalist.appendChild(option);
    })
})

let updateCurrentWeather = (data) => {
    city.textContent = data.name + ',' + data.sys.country
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    let windDirection;
    let deg = data.wind.deg;
    if (deg > 45 && deg <= 135) {
        windDirection = 'East';
    } else if (deg > 135 && deg <= 225) {
        windDirection = 'South';
    } else if (deg > 225 && deg <= 315) {
        windDirection = 'West';
    } else {
        windDirection = 'North';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed
    temperature.textContent = data.main.temp > 0 ?
        '+' + Math.round(data.main.temp) :
        Math.round(data.main.temp);
    
    let imgID = data.weather[0].id;
    weatherImages.forEach(obj => {
        if (obj.ids.includes(imgID)) {
            image.src = obj.url;
        }
    })
}

let updateForecast = (forecast) => {
    forecastBlock.innerHTML = '';
    forecast.forEach(day => {
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let dayName = dayOfWeek(day.dt * 1000);
        let temperature = day.main.temp > 0 ?
            '+' + Math.round(day.main.temp) :
            Math.round(day.main.temp);
        let forecastItem = `
            <article class="weather_forecast_item">
                <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather_forecast_icon">
                <h3 class="weather_forecast_day">${dayName}</h3>
                <p class="weather_forecast-temp"><span class="value">${temperature}</span> &deg;C</p>
            </article>
            `;
        forecastBlock.insertAdjacentHTML('beforeend', forecastItem);
    })
}

let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', { weekday: 'long' });
}

let init = async () => {
    await weatherForCity('Dubai');
    document.body.style.filter = 'blur(0)';
}
init();