import React, { useState, useEffect } from 'react';

const Getnetwork = () => {
  const [info, setInfo] = useState({
    effectiveType: '',
    downlink: 0,
    rtt: 0,
    quality: '',
  });

  useEffect(() => {
    const updateInfo = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      if (conn) {
        const type = conn.effectiveType || '4g';
        const speed = conn.downlink || 10;
        const delay = conn.rtt || 50;

        let quality = 'high';
        if (type === 'slow-2g' || type === '2g' || speed < 1.5) {
          quality = 'low';
        } else if (type === '3g' || speed < 5) {
          quality = 'medium';
        }

        setInfo({
          effectiveType: type,
          downlink: speed,
          rtt: delay,
          quality: quality,
        });
      }
    };

    updateInfo();

    const conn = navigator.connection;
    if (conn) {
      conn.addEventListener('change', updateInfo);
      return () => conn.removeEventListener('change', updateInfo);
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>🌐 Network Info</h2>
      <p><b>Type:</b> {info.effectiveType}</p>
      <p><b>Speed:</b> {info.downlink} Mbps</p>
      <p><b>Delay:</b> {info.rtt} ms</p>
      <p><b>Quality:</b> {info.quality}</p>
    </div>
  );
};

export default Getnetwork;


