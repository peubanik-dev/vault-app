import { useState,useEffect,useRef } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import socket from "../socket.js";
import { useNavigate } from "react-router-dom";

export default function Tracker() {
    const navigate = useNavigate();

 const [deviceId, setDeviceId] = useState(
  localStorage.getItem("trackerDeviceId") || ""
);

const [deviceSecret, setDeviceSecret] = useState(
  localStorage.getItem("trackerDeviceSecret") || ""
);
  const [loading, setLoading] = useState(false);
 const [connected, setConnected] = useState(
  localStorage.getItem("trackerConnected") === "true"
);
 const watchIdRef = useRef(null);
 useEffect(() => {
  if (!connected || !deviceId) return;

  const emitOnline = () => {
    socket.emit("deviceOnline", { deviceId });
  };
socket.on("connect", emitOnline);
  if (socket.connected) {
    emitOnline();
  } else {
    socket.once("connect", emitOnline);
    socket.connect();
  }

  return () => {
    socket.off("connect", emitOnline);
  };
  
}, [connected, deviceId]);
const handleConnect = async () => {
  if (!deviceId || !deviceSecret) {
    toast.error("Please fill all fields");
    return;
  }

  try {
    setLoading(true);

    const res = await api.post("/device/verify", {
      deviceId,
      deviceSecret,
    });

    toast.success(res.data.message);
    localStorage.setItem("trackerDeviceId", deviceId);
localStorage.setItem("trackerDeviceSecret", deviceSecret);
   setConnected(true);
localStorage.setItem("trackerConnected", "true");
  
    
  } catch (err) {
    toast.error(err.response?.data?.message || "Connection failed");
  } finally {
    setLoading(false);
  }
};
  const handleDisconnect = () => {
    if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
    }
   socket.emit("deviceOffline", {
    deviceId,
});

socket.disconnect();
    
setConnected(false);
localStorage.removeItem("trackerConnected");
  localStorage.removeItem("trackerDeviceId");
  localStorage.removeItem("trackerDeviceSecret");
   setDeviceId("");
  setDeviceSecret("");
    toast.success("Device disconnected");
};
useEffect(() => {
    if (!connected) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
  api.post("/location/update", {
    deviceId,
    deviceSecret,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    speed: position.coords.speed || 0,
    accuracy: position.coords.accuracy,
    battery: 100, 
  })
  .then((res) => {
  console.log("Location response:", res.data);
})
.catch((err) => {
  console.log("Status:", err.response?.status);
  console.log("Response:", err.response?.data);
});
},
      (error) => {
        console.error(error);
        toast.error("Unable to access location");
      },
      {
        enableHighAccuracy: true,
      }
    );

   return () => {
    if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
    }
};
  }, [connected, deviceId, deviceSecret]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h1 className="text-2xl font-bold text-center mb-6">
          GPS Tracker
        </h1>

        <input
          type="text"
          placeholder="Device ID"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <input
          type="text"
          placeholder="Device Secret"
          value={deviceSecret}
          onChange={(e) => setDeviceSecret(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        {connected ? (
  <button
    onClick={handleDisconnect}
    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
  >
    Disconnect Device
  </button>
) : (
  <button
    onClick={handleConnect}
    disabled={loading}
    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
  >
    {loading ? "Connecting..." : "Connect Device"}
  </button>
)}
<button
  onClick={() => navigate("/dashboard")}
  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
>
  Go to Dashboard
</button>
        <p className="text-center mt-4">
          Status:{" "}
          <span
            className={connected ? "text-green-600" : "text-red-600"}
          >
            {connected ? "Connected" : "Not Connected"}
          </span>
        </p>

      </div>
    </div>
  );
}