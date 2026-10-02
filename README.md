# 🌤️ Weather App

A modern, responsive, and elegant frontend web application built using **HTML5, CSS3 (Vanilla CSS with Glassmorphism), and Vanilla JavaScript**. It provides real-time current weather metrics, atmospheric details, and a 5-day weather forecast for any city around the world, powered by the **OpenWeatherMap API** and browser **Geolocation API**.

Designed specifically as a professional college frontend project and a standout portfolio piece for GitHub.

---

## 📖 Description

**Weather App** delivers an intuitive weather tracking experience right from your browser. Whether you are searching for your hometown, exploring weather in global metropolises, or checking local conditions using your device's GPS, this application presents comprehensive atmospheric data in an uncluttered, modern glassmorphic interface that dynamically adapts its aesthetics to current weather conditions.
![App Screenshot](./layout/app-preview.png)
---

## ✨ Features

- 🔍 **Search Weather by City**: Instant weather lookup for any city worldwide with autocomplete/enter key support and friendly input validation.
- 📍 **Use My Location**: Automatically detects your coordinates using the HTML5 Geolocation API (`navigator.geolocation`) and fetches local weather data.
- 🌡️ **Current Weather Display**:
  - City name, country, and local date & time
  - High-resolution weather condition icon & condition summary
  - Current temperature, feels-like temperature, and daily High/Low range
  - Detailed metrics: **Humidity (💧)**, **Wind Speed (💨)**, **Pressure (🌡️)**, **Visibility (👁️)**, and **Cloudiness (☁️)**
- 📅 **5-Day Forecast**: Horizontal desktop and touch-friendly mobile carousel showing upcoming day, date, icon, weather condition, and maximum/minimum temperature.
- 🔄 **Celsius / Fahrenheit Toggle**: Switch seamlessly between `°C` and `°F` without making redundant API requests; all values update dynamically in-memory.
- 🕒 **Recent Searches with LocalStorage**: Remembers your latest 5 searches even after refreshing the browser. Click any past search chip to immediately load its weather.
- 🌓 **Dark & Light Mode**: Clean theme toggle with smooth transitions and persistent theme state stored in `localStorage`.
- 🎨 **Dynamic Weather Backgrounds**: The background gradient subtly adapts to real-time weather conditions:
  - ☀️ Clear Sky (Day)
  - 🌙 Clear Sky (Night)
  - ☁️ Clouds & Overcast
  - 🌧️ Rain
  - 🌦️ Drizzle
  - ⚡ Thunderstorm
  - ❄️ Snow
  - 🌫️ Mist, Fog, and Haze
- ⏳ **Polished Loading State**: Displays a clean animated `🌤️` weather loader during network fetches.
- 🛡️ **Robust Error Handling**: Friendly, clear banners for invalid city names (404), empty inputs, denied location permissions, offline status, or API failures without showing raw JavaScript exceptions.
- 📱 **Fully Responsive Layout**: Built with CSS Grid, Flexbox, and media queries. Adapts seamlessly across desktop monitors, laptops, tablets, and smartphones (featuring a mobile hamburger menu).

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic structure, accessibility (`aria` tags), form elements, meta tags |
| **CSS3** | Vanilla CSS, CSS Grid, Flexbox, Glassmorphism (`backdrop-filter`), CSS variables, responsive media queries, micro-animations |
| **Vanilla JavaScript (ES6+)** | Pure client-side logic, DOM manipulation, asynchronous programming (`async/await`) |
| **Fetch API** | Making asynchronous HTTP requests to retrieve weather and forecast JSON payloads |
| **OpenWeatherMap API** | Weather and 5-day forecast data source |
| **LocalStorage API** | Storing theme preferences (`dark`/`light`), active unit (`°C`/`°F`), and recent search history |
| **Geolocation API** | Accessing user coordinates (`navigator.geolocation.getCurrentPosition`) |

---

## 🌐 API Used

This project utilizes the free **OpenWeatherMap API**:
- **Current Weather API**: `https://api.openweathermap.org/data/2.5/weather`
- **5-Day / 3-Hour Forecast API**: `https://api.openweathermap.org/data/2.5/forecast`

---

## 🔑 How to Get Your Free API Key

Follow these simple steps to obtain your free API key:

1. Visit the OpenWeatherMap website: [https://openweathermap.org/](https://openweathermap.org/)
2. Click **"Sign In"** or **"Sign Up"** to create a free account.
3. Verify your email address by clicking the confirmation link sent to your inbox.
4. Once logged in, click on your account username at the top right and select **"My API Keys"**.
5. You will find a **"Default"** API key already generated, or you can enter a name and click **"Generate"** to create a new key.
6. Copy the 32-character API key string.
7. *Note*: Newly created OpenWeatherMap keys typically take **10 to 30 minutes** to activate on their servers.

---

## 🚀 How to Run the Project

### 1. Open the Project in Antigravity IDE (or VS Code)
Open the workspace directory:
```
weather-app/
```

### 2. Add Your OpenWeatherMap API Key in `script.js`
Open [script.js](file:///c:/Users/DELL/Desktop/snehaaa/weather-app/script.js#L18) and locate the API key declaration near line 18:
```javascript
// Replace "YOUR_API_KEY" with your copied key:
const API_KEY = "YOUR_ACTUAL_API_KEY_HERE";
```
*(Alternatively, you can click the **"Enter Key Here"** button on the application's guide banner to test your key without modifying files).*

> **Tip:** If you do not have an API key yet, the app includes a built-in **Demo Mode** with realistic simulated data for cities like Nashik, Mumbai, Pune, Delhi, London, Tokyo, and New York so you can test all features and UI responsiveness immediately!

### 3. Start a Local Development Server (or Open Directly)
You can run the app using any static server or by double-clicking the file:
- **Option A (Browser directly):** Double-click `index.html` in your file explorer to open it in Chrome, Edge, or Firefox.
- **Option B (VS Code Live Server):** Right-click `index.html` and choose **"Open with Live Server"**.
- **Option C (Command Line / Python):**
  ```bash
  cd weather-app
  python -m http.server 3000
  ```
  Then navigate to `http://localhost:3000` in your web browser.

### 4. Search for a City
Enter any city name (e.g., `Nashik`, `Mumbai`, `London`, `Tokyo`) and press **Enter** or click **Search**!

---

## 📁 Project Structure

```
weather-app/
│
├── index.html        # Main semantic HTML5 document containing navbar, hero, cards & modals
├── style.css         # Complete vanilla CSS design system, glassmorphism, responsive styles & themes
├── script.js         # Modular ES6+ JavaScript handling API calls, state, DOM & local storage
└── README.md         # Detailed project documentation and setup instructions
```

### File Breakdown:
- **`index.html`**: Defines the semantic structure of the website, including responsive navigation, search form, current weather card, 5-day forecast container, recent searches chips, about card, and footer.
- **`style.css`**: Implements a custom design system with CSS custom properties (variables), frosted glassmorphism surfaces (`backdrop-filter`), dynamic weather condition gradients, dark/light theme tokens, and mobile media queries.
- **`script.js`**: Contains beginner-friendly, clean modular functions (`searchWeather`, `fetchCurrentWeather`, `displayForecast`, `getUserLocation`, `toggleTemperatureUnit`, `toggleTheme`, etc.) using modern `async/await` and robust error handling.
- **`README.md`**: Provides comprehensive documentation suitable for GitHub and college submissions.

---

## 🚀 Future Scope & Enhancements

In future iterations, the following capabilities can be incorporated:
- ⏱️ **Hourly Forecast**: 24-hour visual temperature timeline chart.
- 🍃 **Air Quality Index (AQI)**: Integration with OpenWeatherMap Air Pollution API (PM2.5, PM10, O3, NO2).
- 🚨 **Weather Alerts & Warnings**: Real-time severe weather notification banners (storms, heatwaves, cyclones).
- 🌅 **Sunrise & Sunset Times**: Visual solar arc displaying dawn, dusk, and daylight duration.
- ☀️ **UV Index Indicator**: Sun exposure risk meter with sun protection advice.
- 🗺️ **Interactive Weather Radar Maps**: Leaflet.js or Mapbox weather tile overlay (precipitation and temperature radar).
- 📌 **Multiple Pinned Locations**: Saved dashboard of favorite cities with quick comparison cards.

---

## 👩‍💻 Author

**Sneha Dhamane**  
*Computer Engineering Student*  
Frontend Web Development Project (2026)
