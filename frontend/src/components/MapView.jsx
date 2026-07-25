import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  Circle,
} from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const isValidCoord = (lat, lng) =>
  Number.isFinite(Number(lat)) &&
  Number.isFinite(Number(lng));


function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!isValidCoord(center?.[0], center?.[1])) return;

    map.setView(center, map.getZoom(), {
      animate: false,
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


export default function MapView({
  location,
  history = [],
  playbackIndex,
  geofences = [],
  sosLocation,
}) {

  const cleanHistory = history.filter((point) =>
    isValidCoord(point.latitude, point.longitude)
  );


  const path = cleanHistory.map((point) => [
    Number(point.latitude),
    Number(point.longitude),
  ]);


  let currentPoint = null;


  if (
    playbackIndex !== null &&
    history[playbackIndex] &&
    isValidCoord(
      history[playbackIndex].latitude,
      history[playbackIndex].longitude
    )
  ) {
    currentPoint = history[playbackIndex];
  }
  else if (
    location &&
    isValidCoord(location.latitude, location.longitude)
  ) {
    currentPoint = location;
  }
  else if (
    sosLocation &&
    isValidCoord(sosLocation.latitude, sosLocation.longitude)
  ) {
    currentPoint = sosLocation;
  }


  if (!currentPoint) {
    return (
      <div className="h-[400px] bg-white rounded-xl shadow flex items-center justify-center">
        Waiting for location...
      </div>
    );
  }


  const center = [
    Number(currentPoint.latitude),
    Number(currentPoint.longitude),
  ];


  const validGeofences = geofences.filter((g) =>
    isValidCoord(g.latitude, g.longitude)
  );


  return (
    <MapContainer
      center={center}
      zoom={15}
      className="h-[400px] sm:h-[500px] lg:h-full w-full rounded-xl"
    >

      <ChangeView center={center}/>

      {path.length > 1 && (
        <FitBounds path={path}/>
      )}


      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {path.length > 1 && (
        <Polyline positions={path}/>
      )}


      {validGeofences.map((g)=>(
        <Circle
          key={g._id}
          center={[
            Number(g.latitude),
            Number(g.longitude)
          ]}
          radius={Number(g.radius)}
        />
      ))}


      {sosLocation &&
       isValidCoord(sosLocation.latitude,sosLocation.longitude) &&
       (
        <Marker
          position={[
            Number(sosLocation.latitude),
            Number(sosLocation.longitude)
          ]}
        >
          <Popup>
            SOS Location
          </Popup>
        </Marker>
       )
      }


      <Marker position={center}>
        <Popup>
          Device Location
        </Popup>
      </Marker>


    </MapContainer>
  );
}