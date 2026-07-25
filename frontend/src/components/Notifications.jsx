import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const selectedDevice = JSON.parse(
  localStorage.getItem("selectedDevice")
);

const deviceId = selectedDevice?.deviceId;
if (!deviceId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          No device selected
        </h2>
      </div>
    );
  }
  useEffect(() => {

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/notifications/${deviceId}`
        );

        setNotifications(res.data.notifications);

      } catch (error) {
        console.log("Notification fetch error:", error);
      }
    };

    fetchNotifications();

  }, [deviceId]);


  return (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-3xl mx-auto">

      <div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold">
    🔔 Notifications
  </h1>

 <button
  onClick={() => navigate("/dashboard")}
  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow hover:shadow-md border border-gray-200 transition"
>
  <span className="text-lg">←</span>
  <span className="font-medium">Dashboard</span>
</button>
</div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className="flex items-start gap-4 bg-white rounded-xl shadow p-4 border border-gray-200 hover:shadow-md transition"
            >
              <div className="text-3xl">
                {notification.type === "SOS"
                  ? "🆘"
                  : notification.type === "GEOFENCE_ENTER"
                  ? "📍"
                  : "🚪"}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">
                    {notification.type.replace("_", " ")}
                  </h2>

                  {!notification.isRead && (
                    <span className="badge badge-error badge-sm">
                      New
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mt-1">
                  {notification.message}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
);
}