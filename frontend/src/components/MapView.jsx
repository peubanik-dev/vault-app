import { MapContainer, TileLayer, Marker, Popup,Polyline, useMap,Circle } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, map.getZoom(), {
      animate: true,
      duration: 0.8,
    });
  }, [center, map]);

  return null;
}
function FitBounds({ path }) {
  const map = useMap();

  useEffect(() => {
    if (path.length > 1) {
      map.fitBounds(path, {
        padding: [50, 50],
      });
    }
  }, [path, map]);

  return null;
}

export default function MapView({ location,history,playbackIndex, geofences = [],sosLocation}) {
console.log(history);

console.log("Geofences:", geofences);
geofences.forEach((g) => {
  console.log(g.name, g.latitude, g.longitude, g.radius);
});
  const path = history.map((point) => [
    point.latitude,
    point.longitude,
  ]);
const currentPoint =
  history[playbackIndex] || location|| sosLocation;
  console.log("Geofences:", geofences);
  return (
    <MapContainer
  center={[
  currentPoint.latitude,
  currentPoint.longitude,
]}
  zoom={15}
  className="h-[400px] sm:h-[500px] lg:h-full w-full rounded-xl"
>

      
      <FitBounds path={path} />
      <ChangeView
  center={[
    currentPoint.latitude,
    currentPoint.longitude,
  ]}
/>

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {path.length > 1 && (
  <Polyline positions={path} />
)}

{geofences.map((g) => (
  <Circle
    key={g._id}
    center={[g.latitude, g.longitude]}
    radius={g.radius}
    pathOptions={{
      color: "red",
      fillColor: "red",
      fillOpacity: 0.2,
    }}
  />
))}
{sosLocation && (
  <Marker
    position={[
      sosLocation.latitude,
      sosLocation.longitude
    ]}
  >
    <Popup>
      🚨 SOS Location
    </Popup>
  </Marker>
)}

      <Marker
        key={`${location.latitude}-${location.longitude}`}
       position={[
  currentPoint.latitude,
  currentPoint.longitude,
]}
      >
        <Popup>
          <div>
            <h3>Device Location</h3>
            <p>
              Latitude: {currentPoint.latitude}
            </p>
            <p>
              Longitude: {currentPoint.longitude}
            </p>
          </div>
        </Popup>
      </Marker>

    </MapContainer>
  );
}