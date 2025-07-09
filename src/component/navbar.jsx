import React, { useState } from 'react';
import axios from 'axios';
import './Navbar.css';

const Navbar = ({ onSearch, onDetectLocation, networkInfo, cityInput, setCityInput }) => {
  const [detectedCity, setDetectedCity] = useState(null);
  const [detecting, setDetecting] = useState(false);

  const handleDetectLocation = async () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await axios.get(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const city = res.data.city || res.data.locality || res.data.principalSubdivision;
        setDetectedCity(city);
      } catch (err) {
        alert("Failed to detect location");
        console.error(err);
      } finally {
        setDetecting(false);
      }
    });
  };

  const handleCityClick = () => {
    if (detectedCity) {
      onSearch(detectedCity);
      setCityInput(detectedCity);
      setDetectedCity(null);
    }
  };

  return (
    <nav className="navbar-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <img src="/vite.svg" alt="logo" className="navbar-logo" />
        <span className="navbar-title"></span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(cityInput);
        }}
        className="search-form"
      >
        <input
          type="text"
          placeholder="Search city..."
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="navbar-right">
        <button
          onClick={handleDetectLocation}
          disabled={detecting}
          className="navbar-detect-btn"
        >
          {detecting ? 'Detecting...' : 'Detect Location'}
        </button>
        {detectedCity && (
          <button onClick={handleCityClick} className="navbar-city-chip">
            📍 {detectedCity}
          </button>
        )}
        <div className="network-info">
          Network: {networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Detecting...'}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

