import React, { useState } from "react";
import axios from "axios";
import "./HomePage.css";
import { Link } from "react-router-dom";
import ChatBox from "./ChatBox";
import FavoritesCard from './FavoritesCard';


function Homepage({ loggedIn }) {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/weather?location=${location}`
      );
      console.log("Weather response:", response);
      setWeatherData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.code === "Enter" || event.code === "NumpadEnter") {
      handleSearch();
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/w/${iconCode}.png`;
  };

  return (
    <div className="homepage">
      <h1 className="homepage__title">Welcome to the Weather App!</h1>
      <p>
        Search for weather in a specific city or ask our Weather bot about it!
      </p>
      <div className="homepage__search">
        <input
          type="text"
          className="homepage__search-input"
          placeholder="Search for location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="homepage__search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {weatherData && (
        <div className="homepage__weather">
          <h2 className="homepage__weather-title">
            Current Weather in {weatherData.name}
          </h2>
          <div className="homepage__weather-info">
            <p className="homepage__weather-temperature">
              {weatherData.main.temp.toFixed(1)} °C
            </p>
            <p className="homepage__weather-description">
              {weatherData.weather[0].description}
            </p>
            <img
              className="homepage__weather-icon"
              src={getWeatherIcon(weatherData.weather[0].icon)}
              alt={weatherData.weather[0].description}
            />
          </div>
        </div>
      )}

      <div className="homepage__sidebar">
        
        {!loggedIn ? (
          <Link className="homepage__login" to="/signin">
            Log in/Sign up to save favorite locations
          </Link>
        ) : (
          <Link className="homepage__favorites" to="/favorites">
            View Favorites
          </Link>
        )}
        {loggedIn && <ChatBox />}
        {loggedIn && <FavoritesCard />}
      </div>
    </div>
  );
}

export default Homepage;


