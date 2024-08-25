import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import startIconImg from './assets/icons/start-icon.png';
import endIconImg from './assets/icons/end-icon.png';
import movingObjectImg from './assets/icons/moving-icon.png';
import propTypes from "prop-types"
import './App.css';

const startLatLng = [22.1696, 91.4996];
const endLatLng = [22.2637, 91.7159];
const speedKmph = 20; // Speed in km/h
const refreshRate = 0.5; // Refresh rate in seconds (2 FPS)
const speedMod = 250 * speedKmph; //modified speed 250 Kmph

const CustomMarker = ({ position, icon }) => {
  return <Marker position={position} icon={icon} />;
};
CustomMarker.propTypes = {
  position: propTypes.any.isRequired,
  icon: propTypes.any.isRequired
}

const VesselMovement = ({ setCurrentLatLng }) => {
  const map = useMap(); // useMap hook to access the map instance

  useEffect(() => {
    if (!map) return; // Check if map is ready

    const totalDistance = map.distance(startLatLng, endLatLng); // in meters
    const totalTime = totalDistance / speedMod; // in seconds
    const steps = totalTime / refreshRate;
    const latStep = (endLatLng[0] - startLatLng[0]) / steps;
    const lngStep = (endLatLng[1] - startLatLng[1]) / steps;

    let currentStep = 0;
    let currentLatLng = startLatLng;

    const intervalId = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(intervalId);
        setCurrentLatLng(endLatLng); // Ensure it reaches the end point exactly
        return;
      }

      currentLatLng = [
        startLatLng[0] + latStep * currentStep,
        startLatLng[1] + lngStep * currentStep,
      ];

      setCurrentLatLng(currentLatLng);
      currentStep++;
    }, refreshRate * 1000);

    return () => clearInterval(intervalId);
  }, [map, setCurrentLatLng]);

  return null;
};


VesselMovement.propTypes = {
  setCurrentLatLng: propTypes.any.isRequired
}

const App = () => {
  const [currentLatLng, setCurrentLatLng] = useState(startLatLng);

  const startIcon = L.icon({
    iconUrl: startIconImg,
    iconSize: [32, 32],
  });

  const endIcon = L.icon({
    iconUrl: endIconImg,
    iconSize: [32, 32],
  });

  const vesselIcon = L.divIcon({
    className: 'custom-icon', // Add a class name for custom styling
    html: `<img src="${movingObjectImg}" style="width: 14px; height: 78px; transform: rotate(65deg);" />`,
    iconUrl: movingObjectImg,
    iconSize: [14, 78],
  });

  return (
    <MapContainer
      center={startLatLng}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <CustomMarker position={startLatLng} icon={startIcon} />
      <CustomMarker position={endLatLng} icon={endIcon} />
      <CustomMarker position={currentLatLng} icon={vesselIcon} />
      <Polyline positions={[startLatLng, endLatLng]} color="blue" />
      <VesselMovement setCurrentLatLng={setCurrentLatLng} />
    </MapContainer>
  );
};

export default App;
