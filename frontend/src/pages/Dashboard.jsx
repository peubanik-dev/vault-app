import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios"
import MapView from "../components/MapView";
import DeviceInfo from "../components/DeviceInfo";
import api from "../services/api";
import Navbar from "../components/Navbar";
import AddDevice from "../components/AddDevice";
import TravelStats from "../components/TravelStats";
import PlaybackControls from "../components/PlaybackControls";
import socket from "../socket.js";
export default function Dashboard() {
  const [location, setLocation] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [history, setHistory] = useState([]);
  const [playbackIndex, setPlaybackIndex] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);
  const [newSecret, setNewSecret] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [sosLocation, setSosLocation] = useState(null);
  const [stats, setStats] = useState({distance: "0.00", averageSpeed: "0.00",});

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/device", {
        headers: { Authorization: `Bearer ${token}` },
      });
          
      setDevices(res.data.devices);

setSelectedDevice((prev) => {
  if (!prev) return res.data.devices[0] || null;

  return (
    res.data.devices.find(
      (d) => d.deviceId === prev.deviceId
    ) || null
  );
});
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load devices");
    } finally {
      setLoadingDevices(false);
    }
  };
  const fetchStats = async () => {
  if (!selectedDevice) return;

  try {
    const res = await axios.get(
      `http://localhost:5000/api/location/stats/${selectedDevice.deviceId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setStats(res.data);
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};
  const handleSOS = () => {
  if (!selectedDevice) {
    toast.error("No device selected");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        await api.post("/sos/send", {
          deviceId: selectedDevice.deviceId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          message: "Emergency SOS",
        });

        toast.success("SOS sent successfully");
      } catch (error) {
        console.log(error);
        toast.error("Failed to send SOS");
      }
    },
    () => {
      toast.error("Unable to get current location");
    },
    {
      enableHighAccuracy: true,
    }
  );
};

  const handleDeleteDevice = async (e, deviceId) => {
    e.stopPropagation(); 
    if (!window.confirm("Delete this device? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await api.delete(`/device/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(res.data.message || "Device deleted successfully");

      fetchDevices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete device");
    }
  };
  const fetchGeofences = async (deviceId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.get(`/geofence/${deviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setGeofences(res.data);
  } catch (err) {
    console.error(err);
    setGeofences([]);
  }
};
  const fetchLocation = async (deviceId) => {
  try {
    const res = await api.get(`/location/latest/${deviceId}`);
   const loc = res.data.location;
      setLocation(loc);
    if (loc) {
        setHistory((prev) => {
          const last = prev[prev.length - 1];
          const isSamePoint =
            last &&
            last.latitude === loc.latitude &&
            last.longitude === loc.longitude;
          return isSamePoint ? prev : [...prev, loc];
        });
      }
  } catch (err) {
    if (err.response?.status === 404) {
      setLocation(null);
      return;
    }

    console.error(err);
  }
};
  const fetchHistory = async (deviceId) => {
    try {
        const res = await api.get(
            `http://localhost:5000/api/location/history/${deviceId}`
        );

    const sortedHistory = res.data.history.sort(
  (a, b) => new Date(a.createdAt) - new Date(b.createdAt));

setHistory(sortedHistory);    
    console.log(res.data.history);

    } catch (error) {
        console.log(error);
    }
};

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
  if (selectedDevice) {
    fetchStats();
  }
}, [selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) return;
        setHistory([]);

         setPlaybackIndex(0);
    setIsPlaying(false);

    fetchLocation(selectedDevice.deviceId);
    fetchHistory(selectedDevice.deviceId);
     fetchGeofences(selectedDevice.deviceId);
   
  }, [selectedDevice]);
  
  useEffect(() => {
    
  const handleDeviceOnline = ({ deviceId }) => {
    console.log("OFFLINE EVENT RECEIVED:", deviceId);
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId ? { ...device, isOnline: true } : device
      )
    );
    setSelectedDevice((prev) =>
      prev?.deviceId === deviceId ? { ...prev, isOnline: true } : prev
    );
  };

  const handleDeviceOffline = ({ deviceId }) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId ? { ...device, isOnline: false } : device
      )
    );
    setSelectedDevice((prev) =>
      prev?.deviceId === deviceId ? { ...prev, isOnline: false } : prev
    );
  };
  const handleSOSAlert = (data) => {
  console.log("🚨 SOS RECEIVED:", data);

toast.success(`SOS Alert from ${data.deviceId}`);
  setSosLocation({
    latitude: data.latitude,
    longitude: data.longitude,
  });
  setLocation({
    latitude: data.latitude,
    longitude: data.longitude,
  });
};
  

  socket.on("deviceOnline", handleDeviceOnline);
  socket.on("deviceOffline", handleDeviceOffline);
  socket.on("sosAlert", handleSOSAlert);

  return () => {
    
    socket.off("deviceOnline", handleDeviceOnline);
    socket.off("deviceOffline", handleDeviceOffline);
    socket.off("sosAlert", handleSOSAlert);
  };
}, []);

useEffect(() => {
  if (!selectedDevice) return;

  const handleLocationUpdate = (data) => {
    console.log("Socket received:", data);
    if (data.deviceId !== selectedDevice.deviceId) return;

    setLocation((prev) => ({
      ...(prev || {}),
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      accuracy: data.accuracy,
      battery: data.battery,
      device: {
        ...selectedDevice,
        lastSeen: data.lastSeen,
        isOnline: data.isOnline,
        battery: data.battery,
      },
    }));

    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.latitude === data.latitude &&
        last.longitude === data.longitude
      ) {
        return prev;
      }
      return [
        ...prev,
        {
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          accuracy: data.accuracy,
          createdAt: new Date(),
        },
      ];
    });
    fetchStats();
  };

  const handleGeofenceAlert = (data) => {
    console.log("🔥 GEOFENCE SOCKET RECEIVED:", data);
    console.log("Geofence alert received:", data);

    data.alerts.forEach((alert) => {
      if (alert.type === "ENTER") {
        toast.success(`${data.deviceId} entered ${alert.fenceName}`);
      }
      if (alert.type === "EXIT") {
        toast.error(`${data.deviceId} left ${alert.fenceName}`);
      }
    });
  };

  console.log("Registering socket listeners", selectedDevice);

  socket.on("locationUpdated", handleLocationUpdate);
  socket.onAny((event, ...args) => {
    console.log("SOCKET EVENT:", event, args);
  });
  socket.on("geofenceAlert", handleGeofenceAlert);

  return () => {
    socket.off("locationUpdated", handleLocationUpdate);
    socket.off("geofenceAlert", handleGeofenceAlert);
  };
}, [selectedDevice]);
const secretBanner = newSecret && (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4 text-sm max-w-md mx-auto lg:mx-0">
      <p className="font-semibold text-yellow-800 mb-1">
        Save this device secret now — it won't be shown again:
      </p>
      <code className="block bg-white border rounded px-2 py-1 break-all">
        {newSecret}
      </code>
      <button
        onClick={() => setNewSecret(null)}
        className="text-xs text-yellow-700 underline mt-2"
      >
        I've saved it, dismiss
      </button>
    </div>
  );

  if (loadingDevices) {
    return (
      <>
        <Navbar />
        <div className="p-5 text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </>
    );
  }

  if (devices.length === 0) {
  return (
    <>
      <Navbar />
              
      <div className="h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto">
          {secretBanner}
          <AddDevice onDeviceAdded={fetchDevices}
          onSecretReceived={setNewSecret}
           />

          <p className="text-center text-gray-600 mt-6">
            No devices added yet. Add one to start tracking.
          </p>
        </div>
      </div>
    </>
  );
}

  
  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">

        <div className="w-full lg:w-3/4 p-4">
        {secretBanner}
          <AddDevice onDeviceAdded={fetchDevices} 
          onSecretReceived={setNewSecret}/>
          <div className="flex flex-wrap gap-3 mb-4">
            {devices.map((device) => (
              <div key={device._id} className="relative"> {/* ADDED wrapper */}
                <button
                  onClick={() => setSelectedDevice(device)}
                  className={`px-4 py-2 pr-8 rounded-lg ${
                    selectedDevice?._id === device._id
                      ? "bg-blue-600 text-white"
                      : "bg-white shadow"
                  }`}
                >
                  {device.name}
                </button>
                {/* ADDED — delete icon */}
                <button
                  onClick={(e) => handleDeleteDevice(e, device._id)}
                  className={`absolute top-1/2 right-2 -translate-y-1/2 text-xs font-bold ${
                    selectedDevice?._id === device._id
                      ? "text-white hover:text-red-200"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                  title="Delete device"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          
         {location ? (
  <>
    <PlaybackControls
      history={history}
      playbackIndex={playbackIndex}
      setPlaybackIndex={setPlaybackIndex}
      isPlaying={isPlaying}
      setIsPlaying={setIsPlaying}
    />

    <MapView
      location={location}
      history={history}
      playbackIndex={playbackIndex}
      geofences={geofences}
      sosLocation={sosLocation}
    />
  </>
) : (
  <div className="h-[400px] sm:h-[500px] lg:h-full bg-white rounded-xl shadow flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-700">
        No location available
      </h2>
      <p className="text-gray-500 mt-2">
        Open the Tracker and start sharing location.
      </p>
    </div>
  </div>
)}
        </div>


        <div className="w-full lg:w-1/4 p-4">
          <DeviceInfo
            location={location}
            device={selectedDevice}
              handleSOS={handleSOS}
               stats={stats}

          />
        </div>

      </div>

    </div>
  );
}