/**
 * Weather App - Vanilla JavaScript Implementation
 * 
 * Author: Sneha Dhamane (Computer Engineering Student)
 * Project: College Frontend Web Development Project
 * Technologies: HTML5, CSS3, JavaScript (ES6+), Fetch API, Geolocation API, LocalStorage
 */

// ==========================================================================
// 1. Configuration & Global State
// ==========================================================================

/**
 * OpenWeatherMap API Key
 * Replace "YOUR_API_KEY" with your free API key from https://openweathermap.org/api
 * Example: const API_KEY = "1a2b3c4d5e6f7g8h9i0j...";
 */
const API_KEY = "2fc9761540a290bf9dc893b1fed9c154";

// Base URLs for OpenWeatherMap API
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Global Application State
const state = {
  currentUnit: "C", // 'C' for Celsius, 'F' for Fahrenheit
  currentTheme: "dark", // 'dark' or 'light'
  currentWeatherData: null, // Stores active weather data in Celsius
  currentForecastData: null, // Stores active 5-day forecast data in Celsius
  recentSearches: [], // Array of recently searched city names (max 5)
  isDemoMode: false // Whether running with simulated data (when no API key is provided)
};

// ==========================================================================
// 2. DOM Elements Cache
// ==========================================================================
const DOM = {
  // Navigation & Controls
  body: document.body,
  unitToggleBtn: document.getElementById("unit-toggle-btn"),
  themeToggleBtn: document.getElementById("theme-toggle-btn"),
  themeIcon: document.getElementById("theme-icon"),
  themeText: document.getElementById("theme-text"),
  hamburgerBtn: document.getElementById("hamburger-btn"),
  mobileDrawer: document.getElementById("mobile-drawer"),

  // Search & Geolocation
  searchForm: document.getElementById("search-form"),
  cityInput: document.getElementById("city-input"),
  searchBtn: document.getElementById("search-btn"),
  locationBtn: document.getElementById("location-btn"),
  clearSearchBtn: document.getElementById("clear-search-btn"),
  popularChips: document.querySelectorAll(".chip-btn"),

  // Alerts, Banner & Loading
  alertBanner: document.getElementById("alert-banner"),
  alertIcon: document.getElementById("alert-icon"),
  alertMessage: document.getElementById("alert-message"),
  alertClose: document.getElementById("alert-close"),
  apiKeyBanner: document.getElementById("api-key-banner"),
  demoModeBtn: document.getElementById("demo-mode-btn"),
  enterKeyBtn: document.getElementById("enter-key-btn"),
  loadingContainer: document.getElementById("loading-container"),

  // Current Weather Card
  weatherCard: document.getElementById("weather-card"),
  cityName: document.getElementById("city-name"),
  dateTime: document.getElementById("date-time"),
  conditionBadge: document.getElementById("condition-badge"),
  badgeConditionText: document.getElementById("badge-condition-text"),
  weatherIcon: document.getElementById("weather-icon"),
  weatherCondition: document.getElementById("weather-condition"),
  temperature: document.getElementById("temperature"),
  tempUnitSymbol: document.getElementById("temp-unit-symbol"),
  feelsLike: document.getElementById("feels-like"),
  tempMax: document.getElementById("temp-max"),
  tempMin: document.getElementById("temp-min"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("wind-speed"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),
  cloudiness: document.getElementById("cloudiness"),

  // Forecast
  forecastContainer: document.getElementById("forecast-cards-container"),

  // Recent Searches
  recentList: document.getElementById("recent-searches-list"),
  clearRecentBtn: document.getElementById("clear-recent-btn"),

  // API Key Modal
  keyModal: document.getElementById("key-modal"),
  apiKeyInput: document.getElementById("api-key-input"),
  saveKeyBtn: document.getElementById("save-key-btn"),
  cancelKeyBtn: document.getElementById("cancel-key-btn"),
  modalCloseBtn: document.getElementById("modal-close-btn")
};

// ==========================================================================
// 3. Application Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initUnit();
  loadRecentSearches();
  setupEventListeners();

  // Check if API key is still the default placeholder
  checkApiKeyStatus();

  // Load default city (Nashik, India) or last searched city
  const lastCity = localStorage.getItem("weather_app_last_city") || "Nashik";
  searchWeather(lastCity);
});

/**
 * Checks whether user has supplied a custom API key.
 * Shows guide banner if API_KEY is default.
 */
function checkApiKeyStatus() {
  const dynamicKey = localStorage.getItem("weather_app_custom_api_key");
  const activeKey = dynamicKey || API_KEY;

  if (activeKey === "YOUR_API_KEY" || !activeKey || activeKey.trim() === "") {
    DOM.apiKeyBanner.classList.remove("hidden");
    state.isDemoMode = true;
  } else {
    DOM.apiKeyBanner.classList.add("hidden");
    state.isDemoMode = false;
  }
}

/**
 * Retrieve active API key (from localStorage override or const variable)
 */
function getActiveApiKey() {
  return localStorage.getItem("weather_app_custom_api_key") || API_KEY;
}

// ==========================================================================
// 4. Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
  // Search Form Submission (Click Search or Press Enter)
  DOM.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSearch();
  });

  DOM.searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch();
  });

  // Geolocation button
  DOM.locationBtn.addEventListener("click", getUserLocation);

  // Clear search input button
  DOM.cityInput.addEventListener("input", () => {
    if (DOM.cityInput.value.trim().length > 0) {
      DOM.clearSearchBtn.classList.remove("hidden");
    } else {
      DOM.clearSearchBtn.classList.add("hidden");
    }
  });

  DOM.clearSearchBtn.addEventListener("click", () => {
    DOM.cityInput.value = "";
    DOM.clearSearchBtn.classList.add("hidden");
    DOM.cityInput.focus();
  });

  // Popular quick city chips
  DOM.popularChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const city = chip.getAttribute("data-city");
      DOM.cityInput.value = city;
      searchWeather(city);
    });
  });

  // Unit toggle button (°C / °F)
  DOM.unitToggleBtn.addEventListener("click", toggleTemperatureUnit);

  // Theme toggle button (Dark / Light)
  DOM.themeToggleBtn.addEventListener("click", toggleTheme);

  // Mobile Hamburger menu toggle
  DOM.hamburgerBtn.addEventListener("click", () => {
    const isOpen = DOM.mobileDrawer.classList.toggle("open");
    DOM.hamburgerBtn.classList.toggle("active", isOpen);
    DOM.hamburgerBtn.setAttribute("aria-expanded", isOpen);
    DOM.mobileDrawer.setAttribute("aria-hidden", !isOpen);
  });

  // Desktop navigation links active state
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Close mobile drawer on navigation link click
  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      DOM.mobileDrawer.classList.remove("open");
      DOM.hamburgerBtn.classList.remove("active");
      DOM.hamburgerBtn.setAttribute("aria-expanded", "false");
      DOM.mobileDrawer.setAttribute("aria-hidden", "true");
    });
  });

  // Clear recent searches
  DOM.clearRecentBtn.addEventListener("click", clearRecentSearches);

  // Alert close button
  DOM.alertClose.addEventListener("click", () => {
    DOM.alertBanner.classList.add("hidden");
  });

  // API Key Guide Banner buttons
  DOM.demoModeBtn.addEventListener("click", () => {
    state.isDemoMode = true;
    showNotification("Demo Mode enabled! Enjoy exploring realistic simulated forecasts.", "info");
    const currentQuery = DOM.cityInput.value.trim() || "Nashik";
    searchWeather(currentQuery);
  });

  DOM.enterKeyBtn.addEventListener("click", () => {
    DOM.keyModal.classList.remove("hidden");
    DOM.apiKeyInput.focus();
  });

  // API Key Modal interactions
  DOM.modalCloseBtn.addEventListener("click", () => DOM.keyModal.classList.add("hidden"));
  DOM.cancelKeyBtn.addEventListener("click", () => DOM.keyModal.classList.add("hidden"));
  DOM.saveKeyBtn.addEventListener("click", () => {
    const inputVal = DOM.apiKeyInput.value.trim();
    if (inputVal) {
      localStorage.setItem("weather_app_custom_api_key", inputVal);
      DOM.keyModal.classList.add("hidden");
      checkApiKeyStatus();
      showNotification("API key saved successfully! Fetching live weather...", "success");
      searchWeather(DOM.cityInput.value.trim() || "Nashik");
    } else {
      alert("Please enter a valid API key string.");
    }
  });
}

// ==========================================================================
// 5. Search Weather Functionality
// ==========================================================================

/**
 * Validates input and triggers search for city
 */
function handleSearch() {
  const cityName = DOM.cityInput.value.trim();

  // Validate input
  if (!cityName) {
    showError("Please enter a city name to search.");
    DOM.cityInput.focus();
    return;
  }

  searchWeather(cityName);
}

/**
 * Searches for a city's current weather and 5-day forecast
 * @param {string} cityName - Name of the city to search for
 */
async function searchWeather(cityName) {
  if (!cityName || cityName.trim() === "") return;

  const sanitizedCity = cityName.trim();
  showLoading("Getting the latest weather...");

  try {
    const activeKey = getActiveApiKey();

    // If still placeholder and demo mode is active, use simulated live data
    if ((activeKey === "YOUR_API_KEY" || !activeKey || state.isDemoMode) && !localStorage.getItem("weather_app_custom_api_key")) {
      const demoData = getDemoWeatherData(sanitizedCity);
      const demoForecast = getDemoForecastData(sanitizedCity);

      // Save valid search
      saveRecentSearch(demoData.name);
      localStorage.setItem("weather_app_last_city", demoData.name);

      // Display weather & forecast
      displayCurrentWeather(demoData);
      displayForecast(demoForecast);
      hideLoading();
      return;
    }

    // Live API Calls with Fetch
    const weatherData = await fetchCurrentWeather(sanitizedCity, false);
    const forecastData = await fetchForecast(sanitizedCity, false);

    // Save recent search
    saveRecentSearch(weatherData.name);
    localStorage.setItem("weather_app_last_city", weatherData.name);

    // Update UI
    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    hideLoading();
  } catch (error) {
    hideLoading();
    handleFetchError(error);
  }
}

/**
 * Fetches current weather from OpenWeatherMap API
 * @param {string|object} query - City name or coordinates object {lat, lon}
 * @param {boolean} isCoords - True if query contains coordinates
 * @returns {Promise<object>} Weather data object
 */
async function fetchCurrentWeather(query, isCoords = false) {
  const activeKey = getActiveApiKey();
  let url = "";

  if (isCoords) {
    url = `${WEATHER_BASE_URL}?lat=${query.lat}&lon=${query.lon}&units=metric&appid=${activeKey}`;
  } else {
    url = `${WEATHER_BASE_URL}?q=${encodeURIComponent(query)}&units=metric&appid=${activeKey}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("CITY_NOT_FOUND");
    } else if (response.status === 401) {
      throw new Error("INVALID_API_KEY");
    } else {
      throw new Error(`API_ERROR_${response.status}`);
    }
  }

  const data = await response.json();
  return data;
}

/**
 * Fetches 5-day / 3-hour forecast from OpenWeatherMap API
 * @param {string|object} query - City name or coordinates object {lat, lon}
 * @param {boolean} isCoords - True if query contains coordinates
 * @returns {Promise<object>} Forecast data object
 */
async function fetchForecast(query, isCoords = false) {
  const activeKey = getActiveApiKey();
  let url = "";

  if (isCoords) {
    url = `${FORECAST_BASE_URL}?lat=${query.lat}&lon=${query.lon}&units=metric&appid=${activeKey}`;
  } else {
    url = `${FORECAST_BASE_URL}?q=${encodeURIComponent(query)}&units=metric&appid=${activeKey}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("CITY_NOT_FOUND");
    } else if (response.status === 401) {
      throw new Error("INVALID_API_KEY");
    } else {
      throw new Error(`API_ERROR_${response.status}`);
    }
  }

  const data = await response.json();
  return data;
}

// ==========================================================================
// 6. Display Current Weather Data
// ==========================================================================

/**
 * Displays current weather data on the weather card
 * @param {object} data - Current weather data from API
 */
function displayCurrentWeather(data) {
  // Store raw Celsius data in state for instant unit conversion
  state.currentWeatherData = data;

  const { name, sys, main, weather, wind, visibility, clouds, dt, timezone } = data;
  const condition = weather[0] || {};
  const isNight = condition.icon ? condition.icon.endsWith("n") : false;

  // City Name & Country
  const country = sys && sys.country ? `, ${sys.country}` : "";
  DOM.cityName.textContent = `${name}${country}`;

  // Formatted Date and Time
  DOM.dateTime.textContent = formatDateTime(dt, timezone);

  // Weather Condition Text
  const conditionMain = condition.main || "Clear";
  const conditionDescription = condition.description || "Clear Sky";
  DOM.weatherCondition.textContent = capitalizeFirstLetter(conditionDescription);
  DOM.badgeConditionText.textContent = conditionMain;

  // Weather Icon
  updateWeatherIcon(DOM.weatherIcon, condition.icon, conditionMain);

  // Temperature values in active unit
  renderCurrentTemperatures();

  // Metrics details
  DOM.humidity.textContent = `${main.humidity ?? 0}%`;

  // Wind Speed: API returns m/s in metric; convert to km/h (1 m/s = 3.6 km/h)
  const rawWindSpeed = wind && typeof wind.speed === "number" ? wind.speed : 0;
  const windKmH = Math.round(rawWindSpeed * 3.6);
  DOM.windSpeed.textContent = `${windKmH} km/h`;

  DOM.pressure.textContent = `${main && main.pressure !== undefined ? main.pressure : 1013} hPa`;

  // Visibility: API returns meters; convert to km
  const visibilityKm = visibility !== undefined && visibility !== null ? (visibility / 1000).toFixed(1) : "10";
  DOM.visibility.textContent = `${visibilityKm} km`;

  const cloudVal = clouds && clouds.all !== undefined ? clouds.all : 0;
  DOM.cloudiness.textContent = `${cloudVal}%`;

  // Update background dynamic theme
  updateWeatherBackground(conditionMain, isNight);

  // Smooth scroll to weather card on small screens
  if (window.innerWidth <= 768) {
    DOM.weatherCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Updates temperature numbers according to active unit (Celsius or Fahrenheit)
 */
function renderCurrentTemperatures() {
  if (!state.currentWeatherData) return;

  const { main } = state.currentWeatherData;
  const unit = state.currentUnit;

  const currentTemp = formatTemp(main.temp, unit);
  const feelsLikeTemp = formatTemp(main.feels_like, unit);
  const maxTemp = formatTemp(main.temp_max, unit);
  const minTemp = formatTemp(main.temp_min, unit);

  DOM.temperature.textContent = currentTemp;
  DOM.tempUnitSymbol.textContent = `°${unit}`;
  DOM.feelsLike.textContent = `Feels like: ${feelsLikeTemp}°${unit}`;
  DOM.tempMax.textContent = `${maxTemp}°${unit}`;
  DOM.tempMin.textContent = `${minTemp}°${unit}`;
}

// ==========================================================================
// 7. Display 5-Day Forecast
// ==========================================================================

/**
 * Processes and displays 5-day forecast
 * OpenWeatherMap forecast provides 3-hour interval timestamps.
 * We group by day, calculate true high/low, and pick midday conditions.
 * @param {object} forecastData - 5-day forecast data object from API
 */
function displayForecast(forecastData) {
  state.currentForecastData = forecastData;
  DOM.forecastContainer.innerHTML = "";

  if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
    DOM.forecastContainer.innerHTML = `<p class="no-recent-text">Forecast data unavailable.</p>`;
    return;
  }

  // Group 3-hour readings by local calendar date (YYYY-MM-DD)
  const daysMap = new Map();

  forecastData.list.forEach((item) => {
    // Determine date string
    const dateObj = new Date(item.dt * 1000);
    const dateKey = dateObj.toISOString().split("T")[0];

    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, []);
    }
    daysMap.get(dateKey).push(item);
  });

  // Extract up to 5 days
  const dailyForecasts = [];
  const entries = Array.from(daysMap.entries());

  // If first day is today and there are at least 5 more days, show upcoming 5 days
  const todayKey = new Date().toISOString().split("T")[0];
  let startIndex = 0;
  if (entries.length > 5 && entries[0][0] === todayKey) {
    startIndex = 1;
  }

  for (let i = startIndex; i < entries.length && dailyForecasts.length < 5; i++) {
    const [dateKey, readings] = entries[i];

    // Compute max and min temperature across the day's readings
    let maxTemp = -Infinity;
    let minTemp = Infinity;

    readings.forEach((r) => {
      if (r.main.temp_max > maxTemp) maxTemp = r.main.temp_max;
      if (r.main.temp_min < minTemp) minTemp = r.main.temp_min;
    });

    // Pick midday reading (closest to 12:00 or 15:00) for condition representation
    const middayReading = readings.find((r) => r.dt_txt && (r.dt_txt.includes("12:00:00") || r.dt_txt.includes("15:00:00"))) || readings[Math.floor(readings.length / 2)];

    const dateSample = new Date(middayReading.dt * 1000);
    const dayName = dateSample.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = dateSample.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    dailyForecasts.push({
      dateKey,
      dayName,
      formattedDate,
      maxTempC: maxTemp,
      minTempC: minTemp,
      condition: middayReading.weather[0] || {}
    });
  }

  // Render cards
  dailyForecasts.forEach((dayData) => {
    const card = createForecastCard(dayData);
    DOM.forecastContainer.appendChild(card);
  });
}

/**
 * Creates a single forecast card DOM element
 * @param {object} dayData - Processed forecast data for a single day
 * @returns {HTMLElement} Forecast card element
 */
function createForecastCard(dayData) {
  const { dayName, formattedDate, maxTempC, minTempC, condition } = dayData;
  const unit = state.currentUnit;

  const displayMax = formatTemp(maxTempC, unit);
  const displayMin = formatTemp(minTempC, unit);

  const card = document.createElement("div");
  card.className = "forecast-card glassmorphism";
  card.dataset.maxC = maxTempC;
  card.dataset.minC = minTempC;

  const iconUrl = condition.icon
    ? `https://openweathermap.org/img/wn/${condition.icon}@2x.png`
    : "https://openweathermap.org/img/wn/02d@2x.png";

  card.innerHTML = `
    <div class="forecast-day">${dayName}</div>
    <div class="forecast-date">${formattedDate}</div>
    <div class="forecast-icon-box">
      <img src="${iconUrl}" alt="${condition.main || "Weather condition"}" loading="lazy" />
    </div>
    <div class="forecast-desc">${capitalizeFirstLetter(condition.description || "Clear")}</div>
    <div class="forecast-temps">
      <span class="forecast-max">${displayMax}°${unit}</span>
      <span class="forecast-divider">/</span>
      <span class="forecast-min">${displayMin}°${unit}</span>
    </div>
  `;

  return card;
}

/**
 * Re-renders forecast temperatures in the active unit without re-fetching
 */
function renderForecastTemperatures() {
  const cards = DOM.forecastContainer.querySelectorAll(".forecast-card");
  const unit = state.currentUnit;

  cards.forEach((card) => {
    const maxC = parseFloat(card.dataset.maxC);
    const minC = parseFloat(card.dataset.minC);

    if (!isNaN(maxC) && !isNaN(minC)) {
      const displayMax = formatTemp(maxC, unit);
      const displayMin = formatTemp(minC, unit);

      const maxElem = card.querySelector(".forecast-max");
      const minElem = card.querySelector(".forecast-min");

      if (maxElem) maxElem.textContent = `${displayMax}°${unit}`;
      if (minElem) minElem.textContent = `${displayMin}°${unit}`;
    }
  });
}

// ==========================================================================
// 8. Geolocation API (Use My Location)
// ==========================================================================

/**
 * Requests current geolocation coordinates from the browser
 */
function getUserLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser. Please search for a city instead.");
    return;
  }

  showLoading("Detecting your location...");

  navigator.geolocation.getCurrentPosition(
    // Success callback
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      await getWeatherByCoordinates(lat, lon);
    },
    // Error callback
    (error) => {
      hideLoading();
      switch (error.code) {
        case error.PERMISSION_DENIED:
          showError("Location access was denied. Please search for a city instead.");
          break;
        case error.POSITION_UNAVAILABLE:
          showError("Location information is unavailable. Please search for a city instead.");
          break;
        case error.TIMEOUT:
          showError("Location request timed out. Please search for a city instead.");
          break;
        default:
          showError("Unable to retrieve location. Please search for a city instead.");
          break;
      }
    },
    {
      timeout: 10000,
      enableHighAccuracy: true
    }
  );
}

/**
 * Fetches and displays weather for geographical coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function getWeatherByCoordinates(lat, lon) {
  try {
    const activeKey = getActiveApiKey();

    if ((activeKey === "YOUR_API_KEY" || !activeKey || state.isDemoMode) && !localStorage.getItem("weather_app_custom_api_key")) {
      // In demo mode without API key, use friendly fallback location
      const demoData = getDemoWeatherData("My Current Location (Demo)");
      const demoForecast = getDemoForecastData("My Current Location (Demo)");
      saveRecentSearch(demoData.name);
      displayCurrentWeather(demoData);
      displayForecast(demoForecast);
      hideLoading();
      showNotification("Showing simulated local weather (Demo Mode). Add API key for live GPS coordinates.", "info");
      return;
    }

    const weatherData = await fetchCurrentWeather({ lat, lon }, true);
    const forecastData = await fetchForecast({ lat, lon }, true);

    saveRecentSearch(weatherData.name);
    localStorage.setItem("weather_app_last_city", weatherData.name);

    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    hideLoading();
  } catch (error) {
    hideLoading();
    handleFetchError(error);
  }
}

// ==========================================================================
// 9. Recent Searches & LocalStorage
// ==========================================================================

/**
 * Saves a city name to LocalStorage (keeps latest 5 unique cities)
 * @param {string} cityName - Name of the city
 */
function saveRecentSearch(cityName) {
  if (!cityName) return;

  // Trim and standardize
  const cleanCity = cityName.trim();

  // Retrieve current recent searches
  let searches = getStoredRecentSearches();

  // Filter out if already present (to move to front)
  searches = searches.filter((item) => item.toLowerCase() !== cleanCity.toLowerCase());

  // Add to top of list
  searches.unshift(cleanCity);

  // Keep only latest 5
  if (searches.length > 5) {
    searches = searches.slice(0, 5);
  }

  // Store in LocalStorage
  localStorage.setItem("weather_app_recent_searches", JSON.stringify(searches));
  state.recentSearches = searches;

  // Re-render recent searches list
  renderRecentSearches();
}

/**
 * Loads recent searches from LocalStorage on page load
 */
function loadRecentSearches() {
  state.recentSearches = getStoredRecentSearches();
  renderRecentSearches();
}

/**
 * Helper to get recent searches array from LocalStorage
 */
function getStoredRecentSearches() {
  try {
    const raw = localStorage.getItem("weather_app_recent_searches");
    if (raw === null) {
      const initial = ["Nashik", "Mumbai", "Pune", "Delhi"];
      localStorage.setItem("weather_app_recent_searches", JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Renders the recent searches buttons in the UI
 */
function renderRecentSearches() {
  DOM.recentList.innerHTML = "";

  if (!state.recentSearches || state.recentSearches.length === 0) {
    DOM.recentList.innerHTML = `<span class="no-recent-text">No recent searches yet. Search for a city above!</span>`;
    DOM.clearRecentBtn.classList.add("hidden");
    return;
  }

  DOM.clearRecentBtn.classList.remove("hidden");

  state.recentSearches.forEach((city) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "recent-city-chip";
    chip.innerHTML = `<span class="chip-pin">📍</span> <span>${city}</span>`;
    chip.title = `Search weather for ${city}`;

    chip.addEventListener("click", () => {
      DOM.cityInput.value = city;
      searchWeather(city);
    });

    DOM.recentList.appendChild(chip);
  });
}

/**
 * Clears recent searches from LocalStorage and UI
 */
function clearRecentSearches() {
  localStorage.setItem("weather_app_recent_searches", JSON.stringify([]));
  state.recentSearches = [];
  renderRecentSearches();
  showNotification("Recent search history cleared.", "info");
}

// ==========================================================================
// 10. Temperature Unit Toggle (°C / °F)
// ==========================================================================

/**
 * Initializes temperature unit from LocalStorage (default °C)
 */
function initUnit() {
  const savedUnit = localStorage.getItem("weather_app_unit");
  if (savedUnit === "F" || savedUnit === "C") {
    state.currentUnit = savedUnit;
  } else {
    state.currentUnit = "C";
  }
  updateUnitToggleUI();
}

/**
 * Toggles between Celsius and Fahrenheit without extra API requests
 */
function toggleTemperatureUnit() {
  state.currentUnit = state.currentUnit === "C" ? "F" : "C";
  localStorage.setItem("weather_app_unit", state.currentUnit);

  updateUnitToggleUI();
  renderCurrentTemperatures();
  renderForecastTemperatures();
}

/**
 * Updates visual indicator for the active unit in the navbar toggle
 */
function updateUnitToggleUI() {
  const unitCOption = DOM.unitToggleBtn.querySelector(".unit-c");
  const unitFOption = DOM.unitToggleBtn.querySelector(".unit-f");

  if (state.currentUnit === "C") {
    unitCOption.classList.add("active");
    unitFOption.classList.remove("active");
  } else {
    unitFOption.classList.add("active");
    unitCOption.classList.remove("active");
  }
}

/**
 * Converts Celsius value to Fahrenheit or returns Celsius
 * @param {number} tempC - Temperature in Celsius
 * @param {string} unit - 'C' or 'F'
 * @returns {number} Formatted rounded temperature
 */
function formatTemp(tempC, unit = "C") {
  if (tempC === null || tempC === undefined) return "--";
  if (unit === "F") {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

// ==========================================================================
// 11. Dark / Light Mode Theme
// ==========================================================================

/**
 * Initializes theme based on LocalStorage or system preference
 */
function initTheme() {
  const savedTheme = localStorage.getItem("weather_app_theme");

  if (savedTheme) {
    state.currentTheme = savedTheme;
  } else {
    // Default to dark mode for modern aesthetic
    state.currentTheme = "dark";
  }

  applyTheme(state.currentTheme);
}

/**
 * Toggles theme between Light and Dark mode
 */
function toggleTheme() {
  state.currentTheme = state.currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("weather_app_theme", state.currentTheme);
  applyTheme(state.currentTheme);
}

/**
 * Applies CSS classes and updates toggle button for theme
 * @param {string} theme - 'dark' or 'light'
 */
function applyTheme(theme) {
  if (theme === "light") {
    DOM.body.classList.remove("theme-dark");
    DOM.body.classList.add("theme-light");
    DOM.themeIcon.textContent = "☀️";
    DOM.themeText.textContent = "Light";
  } else {
    DOM.body.classList.remove("theme-light");
    DOM.body.classList.add("theme-dark");
    DOM.themeIcon.textContent = "🌙";
    DOM.themeText.textContent = "Dark";
  }
}

// ==========================================================================
// 12. Dynamic Weather Background Design
// ==========================================================================

/**
 * Updates body background gradient classes based on weather condition
 * @param {string} condition - Main weather condition (Clear, Clouds, Rain, etc.)
 * @param {boolean} isNight - Whether current condition is night-time
 */
function updateWeatherBackground(condition, isNight = false) {
  // Remove existing weather background classes
  const weatherClasses = [
    "weather-clear-day",
    "weather-clear-night",
    "weather-clouds",
    "weather-rain",
    "weather-drizzle",
    "weather-thunderstorm",
    "weather-snow",
    "weather-mist"
  ];

  weatherClasses.forEach((cls) => DOM.body.classList.remove(cls));

  const lower = (condition || "").toLowerCase();

  if (lower.includes("clear")) {
    DOM.body.classList.add(isNight ? "weather-clear-night" : "weather-clear-day");
  } else if (lower.includes("cloud")) {
    DOM.body.classList.add("weather-clouds");
  } else if (lower.includes("rain")) {
    DOM.body.classList.add("weather-rain");
  } else if (lower.includes("drizzle")) {
    DOM.body.classList.add("weather-drizzle");
  } else if (lower.includes("thunderstorm") || lower.includes("storm")) {
    DOM.body.classList.add("weather-thunderstorm");
  } else if (lower.includes("snow")) {
    DOM.body.classList.add("weather-snow");
  } else if (
    lower.includes("mist") ||
    lower.includes("fog") ||
    lower.includes("haze") ||
    lower.includes("smoke") ||
    lower.includes("dust")
  ) {
    DOM.body.classList.add("weather-mist");
  } else {
    // Default fallback
    DOM.body.classList.add("weather-clear-day");
  }
}

/**
 * Updates weather icon source based on OpenWeatherMap icon code or condition
 */
function updateWeatherIcon(imgElement, iconCode, condition) {
  if (iconCode) {
    imgElement.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    imgElement.alt = condition || "Weather Condition";
  } else {
    imgElement.src = "https://openweathermap.org/img/wn/02d@4x.png";
    imgElement.alt = "Weather Icon";
  }
}

// ==========================================================================
// 13. Loading State & Error Handling
// ==========================================================================

/**
 * Displays the loading animation state
 * @param {string} message - Optional loading message
 */
function showLoading(message = "Getting the latest weather...") {
  const loadingTextElem = DOM.loadingContainer.querySelector(".loading-text");
  if (loadingTextElem) {
    loadingTextElem.textContent = message;
  }
  DOM.loadingContainer.classList.remove("hidden");
  DOM.alertBanner.classList.add("hidden");
}

/**
 * Hides the loading animation state
 */
function hideLoading() {
  DOM.loadingContainer.classList.add("hidden");
}

/**
 * Displays a friendly notification or error message
 * @param {string} message - Message text
 * @param {string} type - 'error', 'success', or 'info'
 */
function showNotification(message, type = "info") {
  DOM.alertBanner.className = `alert-banner ${type}`;
  DOM.alertMessage.textContent = message;

  if (type === "error") {
    DOM.alertIcon.textContent = "❌";
  } else if (type === "success") {
    DOM.alertIcon.textContent = "✅";
  } else {
    DOM.alertIcon.textContent = "ℹ️";
  }

  DOM.alertBanner.classList.remove("hidden");

  // Auto-dismiss after 6 seconds for info or success
  if (type !== "error") {
    setTimeout(() => {
      DOM.alertBanner.classList.add("hidden");
    }, 6000);
  }
}

/**
 * Displays an error banner to the user
 * @param {string} message - User-friendly error text
 */
function showError(message) {
  showNotification(message, "error");
}

/**
 * Converts technical fetch errors into polite, user-friendly messages
 * @param {Error} error - Captured exception
 */
function handleFetchError(error) {
  console.warn("Weather App Error:", error);

  if (!navigator.onLine) {
    showError("Unable to connect. Please check your internet connection.");
    return;
  }

  if (error.message === "CITY_NOT_FOUND") {
    showError("City not found. Please check the spelling and try again.");
  } else if (error.message === "INVALID_API_KEY") {
    showError("Invalid OpenWeatherMap API key. Please check your key or explore in Demo Mode.");
    DOM.apiKeyBanner.classList.remove("hidden");
  } else {
    showError("Unable to retrieve weather data at this moment. Please try again shortly.");
  }
}

// ==========================================================================
// 14. Helper Utility Functions
// ==========================================================================

/**
 * Formats a Unix timestamp with timezone offset into readable date and time
 * Example: "Thursday, Oct 1, 2026 | 06:45 PM"
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {number} timezoneOffset - Timezone offset in seconds
 * @returns {string} Formatted date and time
 */
function formatDateTime(timestamp, timezoneOffset = 0) {
  const localDate = timestamp ? new Date((timestamp + timezoneOffset) * 1000) : new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC"
  };

  try {
    const formatted = new Intl.DateTimeFormat("en-US", options).format(localDate);
    // Split into Day, Date and Time with a vertical bar
    const parts = formatted.split(", ");
    if (parts.length >= 3) {
      return `${parts[0]}, ${parts[1]} | ${parts[2]}`;
    }
    return formatted;
  } catch (e) {
    return new Date().toLocaleString();
  }
}

/**
 * Capitalizes first letter of words in a string
 * @param {string} str - Input text
 * @returns {string} Capitalized text
 */
function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ==========================================================================
// 15. Realistic Demo Mode Data Provider
// (Ensures the app is 100% testable out-of-the-box before adding API Key)
// ==========================================================================

function getDemoWeatherData(cityName) {
  if (!cityName || typeof cityName !== "string") {
    throw new Error("CITY_NOT_FOUND");
  }

  const trimmed = cityName.trim();
  const lower = trimmed.toLowerCase();

  // Test for invalid queries (e.g. contains digits, random symbols, or known invalid test names)
  if (
    /\d/.test(trimmed) ||
    /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(trimmed) ||
    lower.includes("invalid") ||
    lower.includes("xyz") ||
    lower.length < 2
  ) {
    throw new Error("CITY_NOT_FOUND");
  }

  const name = capitalizeFirstLetter(trimmed);

  // Pre-configured realistic profiles
  const profiles = {
    nashik: { temp: 28, feels: 30, max: 31, min: 21, condition: "Partly Cloudy", main: "Clouds", icon: "02d", humidity: 65, wind: 3.3, pressure: 1012, visibility: 10000, clouds: 40, country: "IN" },
    mumbai: { temp: 31, feels: 35, max: 33, min: 26, condition: "Humid & Hazy", main: "Haze", icon: "50d", humidity: 78, wind: 4.5, pressure: 1010, visibility: 8000, clouds: 25, country: "IN" },
    pune: { temp: 27, feels: 28, max: 29, min: 20, condition: "Clear Sky", main: "Clear", icon: "01d", humidity: 55, wind: 3.1, pressure: 1014, visibility: 10000, clouds: 10, country: "IN" },
    delhi: { temp: 32, feels: 34, max: 35, min: 24, condition: "Sunny & Warm", main: "Clear", icon: "01d", humidity: 45, wind: 2.8, pressure: 1011, visibility: 9000, clouds: 15, country: "IN" },
    bengaluru: { temp: 24, feels: 24, max: 27, min: 18, condition: "Scattered Clouds", main: "Clouds", icon: "03d", humidity: 68, wind: 3.8, pressure: 1015, visibility: 10000, clouds: 50, country: "IN" },
    bangalore: { temp: 24, feels: 24, max: 27, min: 18, condition: "Scattered Clouds", main: "Clouds", icon: "03d", humidity: 68, wind: 3.8, pressure: 1015, visibility: 10000, clouds: 50, country: "IN" },
    hyderabad: { temp: 29, feels: 30, max: 32, min: 22, condition: "Few Clouds", main: "Clouds", icon: "02d", humidity: 58, wind: 3.2, pressure: 1013, visibility: 10000, clouds: 30, country: "IN" },
    chennai: { temp: 32, feels: 36, max: 34, min: 26, condition: "Humid & Warm", main: "Clouds", icon: "02d", humidity: 75, wind: 4.2, pressure: 1010, visibility: 9000, clouds: 35, country: "IN" },
    kolkata: { temp: 30, feels: 34, max: 33, min: 25, condition: "Partly Cloudy", main: "Clouds", icon: "02d", humidity: 72, wind: 3.4, pressure: 1011, visibility: 8000, clouds: 40, country: "IN" },
    nagpur: { temp: 30, feels: 31, max: 33, min: 22, condition: "Clear Sky", main: "Clear", icon: "01d", humidity: 50, wind: 2.9, pressure: 1012, visibility: 10000, clouds: 10, country: "IN" },
    jaipur: { temp: 31, feels: 32, max: 34, min: 22, condition: "Clear Sky", main: "Clear", icon: "01d", humidity: 40, wind: 3.0, pressure: 1012, visibility: 10000, clouds: 5, country: "IN" },
    goa: { temp: 29, feels: 32, max: 31, min: 24, condition: "Tropical Breeze", main: "Clouds", icon: "02d", humidity: 76, wind: 4.8, pressure: 1012, visibility: 10000, clouds: 30, country: "IN" },
    london: { temp: 16, feels: 15, max: 18, min: 11, condition: "Light Rain", main: "Rain", icon: "10d", humidity: 82, wind: 5.2, pressure: 1016, visibility: 9000, clouds: 80, country: "GB" },
    tokyo: { temp: 22, feels: 22, max: 24, min: 17, condition: "Scattered Clouds", main: "Clouds", icon: "03d", humidity: 60, wind: 3.9, pressure: 1018, visibility: 10000, clouds: 45, country: "JP" },
    "new york": { temp: 20, feels: 19, max: 22, min: 14, condition: "Clear Sky", main: "Clear", icon: "01d", humidity: 50, wind: 4.1, pressure: 1015, visibility: 10000, clouds: 10, country: "US" },
    paris: { temp: 18, feels: 17, max: 20, min: 12, condition: "Broken Clouds", main: "Clouds", icon: "04d", humidity: 70, wind: 4.0, pressure: 1016, visibility: 10000, clouds: 65, country: "FR" },
    sydney: { temp: 23, feels: 23, max: 25, min: 16, condition: "Sunny & Mild", main: "Clear", icon: "01d", humidity: 58, wind: 4.6, pressure: 1020, visibility: 10000, clouds: 15, country: "AU" },
    dubai: { temp: 36, feels: 39, max: 38, min: 28, condition: "Clear & Hot", main: "Clear", icon: "01d", humidity: 42, wind: 3.6, pressure: 1010, visibility: 10000, clouds: 0, country: "AE" },
    singapore: { temp: 30, feels: 35, max: 32, min: 25, condition: "Passing Thunderstorm", main: "Thunderstorm", icon: "11d", humidity: 80, wind: 3.1, pressure: 1009, visibility: 8000, clouds: 75, country: "SG" },
    "my current location (demo)": { temp: 27, feels: 28, max: 30, min: 21, condition: "Pleasant & Clear", main: "Clear", icon: "01d", humidity: 60, wind: 3.5, pressure: 1013, visibility: 10000, clouds: 20, country: "Local" }
  };

  const lookupKey = lower;
  const profile = profiles[lookupKey] || {
    temp: 25,
    feels: 26,
    max: 28,
    min: 18,
    condition: "Partly Cloudy",
    main: "Clouds",
    icon: "02d",
    humidity: 60,
    wind: 3.4,
    pressure: 1013,
    visibility: 10000,
    clouds: 30,
    country: "Global"
  };

  return {
    name: name,
    sys: { country: profile.country },
    dt: Math.floor(Date.now() / 1000),
    timezone: 19800, // +5:30 IST
    main: {
      temp: profile.temp,
      feels_like: profile.feels,
      temp_max: profile.max,
      temp_min: profile.min,
      humidity: profile.humidity,
      pressure: profile.pressure
    },
    weather: [
      {
        main: profile.main,
        description: profile.condition,
        icon: profile.icon
      }
    ],
    wind: { speed: profile.wind },
    visibility: profile.visibility,
    clouds: { all: profile.clouds }
  };
}

function getDemoForecastData(cityName) {
  const current = getDemoWeatherData(cityName);
  const baseTemp = current.main.temp;
  const list = [];
  const now = Math.floor(Date.now() / 1000);

  // Generate 5 days of 3-hour mock readings
  for (let d = 1; d <= 5; d++) {
    const dayTimestamp = now + d * 86400;
    const dateStr = new Date(dayTimestamp * 1000).toISOString().split("T")[0];

    // Day variation
    const dayMax = baseTemp + (d % 3) - 1;
    const dayMin = baseTemp - 6 + (d % 2);

    const conditions = [
      { main: "Clear", desc: "Sunny & Clear", icon: "01d" },
      { main: "Clouds", desc: "Partly Cloudy", icon: "02d" },
      { main: "Rain", desc: "Light Passing Rain", icon: "10d" },
      { main: "Clouds", desc: "Overcast Clouds", icon: "04d" },
      { main: "Clear", desc: "Pleasant & Clear", icon: "01d" }
    ];
    const cond = conditions[(d - 1) % conditions.length];

    // Midday reading
    list.push({
      dt: dayTimestamp,
      dt_txt: `${dateStr} 12:00:00`,
      main: {
        temp: dayMax,
        temp_max: dayMax,
        temp_min: dayMin
      },
      weather: [
        {
          main: cond.main,
          description: cond.desc,
          icon: cond.icon
        }
      ]
    });
  }

  return { list };
}
