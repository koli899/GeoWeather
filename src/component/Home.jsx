import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Get_graph.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const defaultCities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

const Home = () => {
  const [cityInput, setCityInput] = useState('');
  const [networkInfo, setNetworkInfo] = useState({ downlink: null });
  const [cityWeather, setCityWeather] = useState([]);
  const [searchedCity, setSearchedCity] = useState(null);
  const navigate = useNavigate();

  // Network info
  useEffect(() => {
    const updateNetwork = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) setNetworkInfo({ downlink: conn.downlink });
    };
    updateNetwork();
    const conn = navigator.connection;
    if (conn) {
      conn.addEventListener('change', updateNetwork);
      return () => conn.removeEventListener('change', updateNetwork);
    }
  }, []);

  // Fetch default cities
  useEffect(() => {
    Promise.all(defaultCities.map(async (city) => {
      try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=c3dcc7f14c661c43f21ecc37e95d683f`);
        return {
          name: res.data.name,
          temp: Math.round(res.data.main.temp),
          desc: res.data.weather[0].description,
          humidity: res.data.main.humidity,
          wind: res.data.wind.speed,
          icon: res.data.weather[0].icon
        };
      } catch {
        return { name: city, temp: '-', desc: '-', humidity: '-', wind: '-', icon: '01d' };
      }
    })).then(setCityWeather);
  }, []);

  // Search city
  const handleSearch = async (city) => {
    if (!city) return;
    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=c3dcc7f14c661c43f21ecc37e95d683f`);
      setSearchedCity({
        name: res.data.name,
        temp: Math.round(res.data.main.temp),
        desc: res.data.weather[0].description,
        humidity: res.data.main.humidity,
        wind: res.data.wind.speed,
        icon: res.data.weather[0].icon,
        lat: res.data.coord.lat,
        lon: res.data.coord.lon
      });
    } catch {
      setSearchedCity({ name: city, temp: '-', desc: 'Not found', humidity: '-', wind: '-', icon: '01d' });
    }
  };

  // Detect location
  const handleDetectLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      localStorage.setItem('forecast_coords', JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude }));
      navigate('/details');
    });
  };

  // Card click handler
  const handleCardClick = (city) => {
    if (city.lat && city.lon) {
      localStorage.setItem('forecast_coords', JSON.stringify({ latitude: city.lat, longitude: city.lon }));
      navigate('/details');
    } else {
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=c3dcc7f14c661c43f21ecc37e95d683f`)
        .then(res => {
          localStorage.setItem('forecast_coords', JSON.stringify({ latitude: res.data.coord.lat, longitude: res.data.coord.lon }));
          navigate('/details');
        });
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Navbar
        onSearch={handleSearch}
        onDetectLocation={handleDetectLocation}
        networkInfo={networkInfo}
        cityInput={cityInput}
        setCityInput={setCityInput}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '1.5rem',
        padding: '2rem'
      }}>
        {searchedCity ? (
          <WeatherCard city={searchedCity} onClick={() => handleCardClick(searchedCity)} />
        ) : (
          cityWeather.map((city, idx) => (
            <WeatherCard key={idx} city={city} onClick={() => handleCardClick(city)} />
          ))
        )}
      </div>
    </div>
  );
};

// Extracted Weather Card
const WeatherCard = ({ city, onClick }) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      padding: '1rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <h3 style={{ color: '#007bff', marginBottom: '0.5rem' }}>{city.name}</h3>
    <img src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`} alt="icon" style={{ marginBottom: '0.5rem' }} />
    <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#333' }}>
      <strong>Temp:</strong> {city.temp}°C
    </p>
    <p style={{ color: '#555' }}><strong>Desc:</strong> {city.desc}</p>
    <p style={{ color: '#555' }}><strong>Humidity:</strong> {city.humidity}%</p>
    <p style={{ color: '#555' }}><strong>Wind:</strong> {city.wind} m/s</p>
  </div>
);

export default Home;
