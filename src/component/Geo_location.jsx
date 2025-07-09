import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Geolocation = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [data, setData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);

      const API_endpoint = "https://api.openweathermap.org/data/2.5/weather";
      const finalAPIEndPoint = `${API_endpoint}?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=c3dcc7f14c661c43f21ecc37e95d683f`;

      axios.get(finalAPIEndPoint)
        .then((response) => {
          setData(response.data);
          setShowDetails(true);
          localStorage.setItem('forecast_coords', JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude }));
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
    });
  };

  const handleViewDetails = () => {
    navigate('/details');
  };

  
  return (
    <div className="geo-container card">
      <h1>📍 Your Current Location</h1>
      <button className="primary-btn" onClick={getLocation}>Get Location</button>
      
      {showDetails && data && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>City:</strong> {data.name}</p>
          <p><strong>Latitude:</strong> {latitude}</p>
          <p><strong>Longitude:</strong> {longitude}</p>
          <p><strong>Temperature:</strong> {Math.round(data.main.temp - 273.15)}°C</p>
          <p><strong>Weather:</strong> {data.weather[0].description}</p>
          <button className="secondary-btn" onClick={handleViewDetails}>View Details</button>
        </div>
      )}
    </div>
  );
};

export default Geolocation;

