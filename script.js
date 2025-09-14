const cityInput = document.getElementById('city');
const fetchBtn = document.getElementById('fetch-btn');
const weatherInfoDiv = document.getElementById('weather-info');

const API_KEY = 'eca4361e2b6feccaa8f07c9881560a58'; // Replace with your actual key (e.g., 'abc123def456')

async function fetchWeather(city) {
    try {
        weatherInfoDiv.innerHTML = '<p>Loading...</p>';

        // Fetch current weather
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        console.log('Fetching current URL:', currentUrl);
        const currentResponse = await fetch(currentUrl);
        console.log('Current response status:', currentResponse.status);
        if (!currentResponse.ok) {
            const errorText = await currentResponse.text();
            throw new Error(`Current weather HTTP ${currentResponse.status}: ${errorText}`);
        }
        const currentData = await currentResponse.json();
        console.log('Current weather data:', currentData);

        // Fetch 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        console.log('Fetching forecast URL:', forecastUrl);
        const forecastResponse = await fetch(forecastUrl);
        console.log('Forecast response status:', forecastResponse.status);
        if (!forecastResponse || typeof forecastResponse.text !== 'function') {
            throw new Error('Invalid forecast response: Not a valid Response object');
        }
        if (!forecastResponse.ok) {
            const errorText = await forecastResponse.text();
            throw new Error(`Forecast HTTP ${forecastResponse.status}: ${errorText}`);
        }
        const forecastData = await forecastResponse.json();
        console.log('Forecast data:', forecastData);

        // Outfit suggestion
        const temp = currentData.main.temp;
        const condition = currentData.weather[0].main.toLowerCase();
        let outfit = 'Wear comfortable clothes.';
        if (temp < 10) outfit = 'Bundle up with a warm coat!';
        else if (temp < 20) outfit = 'A light jacket should do.';
        if (condition.includes('rain')) outfit += ' Bring an umbrella!';

        // Render UI
        const iconUrl = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
        weatherInfoDiv.innerHTML = `
            <div class="current-weather">
                <h2>${currentData.name} Weather</h2>
                <p><img src="${iconUrl}" alt="Weather icon"> ${currentData.weather[0].description}</p>
                <p><strong>Temperature:</strong> ${temp}°C</p>
                <p><strong>Humidity:</strong> ${currentData.main.humidity}%</p>
                <p class="outfit">${outfit}</p>
            </div>
            <h3>5-Day Forecast</h3>
            <div class="forecast">
                ${forecastData.list
                    .filter((item, index) => index % 8 === 0) // Daily at 12:00
                    .slice(0, 5)
                    .map(item => `
                        <div class="forecast-day">
                            <p>${new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather icon">
                            <p>${item.main.temp}°C</p>
                            <p>${item.weather[0].description}</p>
                        </div>
                    `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Fetch error:', error.message, error.stack);
        weatherInfoDiv.innerHTML = `<p class="error">Error: ${error.message.includes('404') ? 'City not found!' : error.message}</p>`;
    }
}

fetchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
        weatherInfoDiv.innerHTML = '<p class="error">Please enter a city!</p>';
        return;
    }
    fetchWeather(city);
});

// Default load
fetchWeather('London');
