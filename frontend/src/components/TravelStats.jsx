import { useEffect, useState } from "react";

export default function TravelStats({ history }) {
  const [stats, setStats] = useState({
    distance: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    points: 0,
    duration: 0,
  });

  useEffect(() => {
    if (!history || history.length < 2) {
      setStats({
        distance: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        points: history?.length || 0,
        duration: 0,
      });
      return;
    }

    let totalDistance = 0;
    let totalSpeed = 0;
    let maxSpeed = 0;

    for (let i = 0; i < history.length; i++) {
      const speed = history[i].speed || 0;

      totalSpeed += speed;
      maxSpeed = Math.max(maxSpeed, speed);

      if (i > 0) {
        totalDistance += calculateDistance(
          history[i - 1].latitude,
          history[i - 1].longitude,
          history[i].latitude,
          history[i].longitude
        );
      }
    }

    const start = new Date(history[0].createdAt);
    const end = new Date(history[history.length - 1].createdAt);

    const duration =
      (end - start) / (1000 * 60); // minutes

    setStats({
      distance: totalDistance.toFixed(2),
      avgSpeed: ((totalSpeed / history.length) * 3.6).toFixed(1),
      maxSpeed: (maxSpeed * 3.6).toFixed(1),
      points: history.length,
      duration: duration.toFixed(1),
    });

  }, [history]);


  return (
    <div className="bg-white rounded-xl shadow-lg p-5 mt-4">

      <h2 className="text-xl font-bold mb-4">
        Travel Statistics
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <p>📏 Distance: {stats.distance} km</p>

        <p>🚗 Avg Speed: {stats.avgSpeed} km/h</p>

        <p>⚡ Max Speed: {stats.maxSpeed} km/h</p>

        <p>📍 Points: {stats.points}</p>

        <p>⏱ Duration: {stats.duration} min</p>

      </div>

    </div>
  );
}


function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2-lat1) * Math.PI / 180;
  const dLon = (lon2-lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) *
    Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R*c;
}