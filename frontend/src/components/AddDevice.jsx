import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function AddDevice({ onDeviceAdded, onSecretReceived }) {
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
        if (!name.trim() || !deviceId.trim()) {
  toast.error("Please fill in all fields");
  return;
}
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.post(
        "/device/add",
        { name, deviceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || "Device added successfully");

      onSecretReceived(res.data.device.deviceSecret);

      setName("");
      setDeviceId("");

      onDeviceAdded();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4 w-full">

      <h2 className="text-lg font-semibold mb-3 text-center">
        Add Device
      </h2>

      
      <form onSubmit={handleSubmit} className="space-y-3">

        <input
          type="text"
          placeholder="Device name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full border rounded-lg px-3 py-1.5 text-sm"
        />

        <input
          type="text"
          placeholder="Device ID"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          className="block w-full border rounded-lg px-3 py-1.5 text-sm"
        />

        <button
          disabled={loading}
          className="block w-full bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 text-sm"
        >
          {loading ? "Adding..." : "Add Device"}
        </button>

      </form>

    </div>
  );
}