import axios from "axios";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import "./Favorites.css";
import { isEqual } from "lodash";
import { FaTrash } from "react-icons/fa";


function CityCard({ city, weatherData, fetchWeatherData }) {
    const [iconUrl, setIconUrl] = useState("");
  
    useEffect(() => {
      const iconCode = weatherData.weather[0].icon;
      const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
      setIconUrl(iconUrl);
    }, [weatherData]);
  
    const handleDeleteClick = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken();
        await axios.delete(`http://localhost:5000/favorites/${city}`, { data: { idToken } });
        // fetch updated weather data for all favorite cities
        fetchWeatherData();
      } catch (error) {
        console.error('Error removing favorite city:', error);
      }
    };
  
    return (
        <div className="city-card">
          <div className="trash-icon">
            <button onClick={handleDeleteClick}>
              <FaTrash />
            </button>
          </div>
          <h3>{city}</h3>
          <div className="city-card__weather">
            <img src={iconUrl} alt={weatherData.weather[0].description} />
            <p>{weatherData.main.temp}°C</p>
            <p>{weatherData.weather[0].description}</p>
          </div>
        </div>
      );
  }
  

  function Favorites() {
    const [city, setCity] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [weatherData, setWeatherData] = useState({});
  
    const isValidCity = async (city) => {
      const openWeatherApiKey = '';
      try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}`);
        return true;
      } catch (error) {
        return false;
      }
    }
    
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!city) {
        alert("Please enter a valid city name.");
        return;
      }
      if (favorites.includes(city)) {
        alert("You have already added this city.");
        return;
      }
      if (!await isValidCity(city)) {
        alert("Please enter a valid city name.");
        return;
      }
      try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await axios.post("http://localhost:5000/favorites", {
          idToken,
          city,
        });
        setCity(""); // clear the input field
      
        // fetch updated weather data for all favorite cities
        fetchWeatherData();
      } catch (error) {
        console.error("Error adding favorite city:", error);
      }
    };
    
    
  
    const fetchWeatherData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return;
      }
      const userId = auth.currentUser.uid;
      const userRef = doc(collection(db, "users"), userId);
      const userDoc = await getDoc(userRef);
    
      let newData = {};
    
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFavorites(userData.favorites || []);
    
        const promises = userData.favorites.map(async (city) => {
          if (!weatherData[city]) {
            const response = await axios.get(
              `http://localhost:5000/weather?location=${city}`
            );
            return { city, data: response.data };
          }
          return null;
        });
        const results = await Promise.all(promises);
        newData = results.reduce((obj, result) => {
          if (result) {
            obj[result.city] = result.data;
          }
          return obj;
        }, {});
      } else {
        console.log("User does not exist.");
      }
    
      // Update state only if data is different
      if (!isEqual(weatherData, newData)) {
        setWeatherData(newData);
      }
    };
    
    
    useEffect(() => {
        const storedFavorites = JSON.parse(localStorage.getItem("favorites"));
        if (storedFavorites && storedFavorites.length > 0) {
          setFavorites(storedFavorites);
          // fetch weather data for stored favorites
          const fetchStoredWeatherData = async () => {
            const promises = storedFavorites.map(async (city) => {
              const response = await axios.get(
                `http://localhost:5000/weather?location=${city}`
              );
              return { city, data: response.data };
            });
            const results = await Promise.all(promises);
            const newData = results.reduce((obj, result) => {
              obj[result.city] = result.data;
              return obj;
            }, {});
            setWeatherData(newData);
          };
          fetchStoredWeatherData();
        }
      }, []);
    
    
    useEffect(() => {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);
    
    useEffect(() => {
      fetchWeatherData();
    }, []);
  

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Favorite City:
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>
        <button type="submit">Add Favorite City</button>
      </form>
      <h2>Weather right now in your favorite cities:</h2>
      <div className="city-cards">
        {favorites.map(
          (city) =>
            weatherData[city] && (
              <CityCard
                key={city}
                city={city}
                weatherData={weatherData[city]}
                fetchWeatherData={fetchWeatherData}
              />
            )
        )}
      </div>
    </div>
  );
}

export default Favorites;
