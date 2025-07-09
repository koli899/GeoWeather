import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Get_graph.css';

const weatherBg = (desc) => {
  if (!desc) return '';
  desc = desc.toLowerCase();
  if (desc.includes('rain')) return 'url("https://www.freevector.com/uploads/vector/preview/7040/FreeVector-Rain-Background.jpg")';
  if (desc.includes('cloud')) return 'url("https://wallpaper.dog/large/20440433.jpg")';
  if (desc.includes('clear')) return 'url("https://wallpaperaccess.com/full/1909536.jpg")';
  if (desc.includes('snow')) return 'url("https://images.unsplash.com/photo-1608889175123-17801c1b6503")';
  if (desc.includes('mist') || desc.includes('fog') || desc.includes('haze')) return 'url("https://img.freepik.com/free-photo/foggy-forest-mountain-scenery-generated-by-ai_188544-23120.jpg")';
  return '';
};

const Getgraph = () => {
  const canvasRef = useRef(null);
  const [forecast, setForecast] = useState([]);
  const [bg, setBg] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const { latitude, longitude } = JSON.parse(localStorage.getItem('forecast_coords')) || {};
    if (!latitude || !longitude) return;

    const API_KEY = 'c3dcc7f14c661c43f21ecc37e95d683f';
    const API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

    axios.get(API_URL)
      .then((res) => {
        setCity(res.data.city.name);
        const list = res.data.list;
        const dailyTemps = {};
        const dailyDetails = {};

        list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          if (!dailyTemps[date]) dailyTemps[date] = [];
          dailyTemps[date].push(item.main.temp);
          if (!dailyDetails[date]) dailyDetails[date] = [];
          dailyDetails[date].push(item);
        });

        const forecastData = Object.entries(dailyTemps).slice(0, 5).map(([date, temps]) => {
          const details = dailyDetails[date][0];
          return {
            date: new Date(date).toLocaleDateString(),
            temp: (temps.reduce((sum, t) => sum + t, 0) / temps.length).toFixed(1),
            temps,
            desc: details.weather[0].description,
            humidity: details.main.humidity,
            wind: details.wind.speed,
            icon: details.weather[0].icon
          };
        });

        setForecast(forecastData);
        setBg(weatherBg(forecastData[0]?.desc));

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padding = 50;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        const maxTemp = Math.max(...forecastData.map(d => parseFloat(d.temp)));
        const minTemp = Math.min(...forecastData.map(d => parseFloat(d.temp)));
        const stepX = width / (forecastData.length - 1);

        // Draw axes (white)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Draw line chart (dark blue)
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        forecastData.forEach((point, index) => {
          const x = padding + index * stepX;
          const y = padding + ((maxTemp - point.temp) / (maxTemp - minTemp || 1)) * height;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Draw points and labels
        forecastData.forEach((point, index) => {
          const x = padding + index * stepX;
          const y = padding + ((maxTemp - point.temp) / (maxTemp - minTemp || 1)) * height;

          // Circle
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();

          // Temp label
          ctx.fillStyle = '#000';
          ctx.font = '13px Arial';
          ctx.fillText(`${point.temp}°C`, x - 18, y - 12);

          // Date label
          ctx.save();
          ctx.translate(x, canvas.height - padding + 18);
          ctx.rotate(-Math.PI / 8);
          ctx.fillText(point.date, -30, 0);
          ctx.restore();
        });

        // Y-axis temp labels (white)
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(`${maxTemp.toFixed(1)}°C`, 5, padding + 5);
        ctx.fillText(`${minTemp.toFixed(1)}°C`, 5, canvas.height - padding);
      })
      .catch((err) => {
        console.error('Error fetching forecast data:', err);
      });
  }, []);

  return (
    <div
      className="weather-container"
      style={{
        backgroundImage: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div className="city-title">{city && `📍 ${city}`}</div>
      <p>This graph shows the average daily temperature for the next 5 days based on your current location.</p>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="responsive-canvas"
        ></canvas>
      </div>

      <div className="forecast-cards">
        {forecast.map((day, idx) => (
          <div className="weather-card" key={idx}>
            <h3>{day.date}</h3>
            <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt="icon" />
            <p><strong>Avg Temp:</strong> {day.temp}°C</p>
            <p><strong>Desc:</strong> {day.desc}</p>
            <p><strong>Humidity:</strong> {day.humidity}%</p>
            <p><strong>Wind:</strong> {day.wind} m/s</p>
            <p><strong>All temps:</strong> {day.temps.map(t => t.toFixed(1)).join(', ')}°C</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        style={{
          backgroundColor: "blue",
          color: "white",
          border: "none",
          padding: "10px",
          fontWeight: "600",
          borderRadius: "10px",
          marginTop: "20px"
        }}
      >
        ← Back
      </button>
    </div>
  );
};

export default Getgraph;
