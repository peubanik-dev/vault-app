export default function DeviceInfo({ location,device,handleSOS, stats, }) {
   if (!location) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full flex items-center justify-center">
        <p className="text-gray-500 text-center">
          No location received yet.
        </p>
      </div>
    );
  }
const isOnline = device?.isOnline;
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">

      <h2 className="text-2xl font-bold mb-6">
        Device Information
      </h2>

      <div className="space-y-4">

        <p>
          📱  Device : {device?.name}
        </p>

       <p>
🔋 Battery : {device?.battery != null ? `${device.battery}%` : "N/A"}</p>
<p>
  🚗 Current Speed :{" "}{location.speed != null  ? (location.speed * 3.6).toFixed(1)   : "0.0"}{" "} km/h
</p>

<p>
  🛣️ Distance Today : {stats?.distance ?? "0.00"} km
</p>

<p>
  ⚡ Average Speed : {stats?.averageSpeed ?? "0.00"} km/h
</p>
        <p>
          📍 Latitude : {location.latitude.toFixed(6)}
        </p>

        <p>
          📍 Longitude : {location.longitude.toFixed(6)}
        </p>

       <p
  className={`font-semibold ${
    isOnline
      ? "text-green-600"
      : "text-red-600"
  }`}
>
  {isOnline ? "🟢 Online" : "🔴 Offline"}
</p>

<p>
  🕒 Last Seen :{" "}
{device?.lastSeen
  ? new Date(device.lastSeen).toLocaleString()
  : "N/A"}
</p>
      </div>

      <button
  onClick={handleSOS}className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
>
  🚨 SOS
</button>

    </div>
  );
}