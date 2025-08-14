import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useNavigate } from 'react-router-dom';

// Fix leaflet icon paths for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Define colors by line type
const typeColors = {
  highline: '#704786',
  waterline: '#18abc9',
  parkline: '#bfa33f',
};

// Create custom cluster icon based on types and count
function createClusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers();
  const types = new Set(markers.map(m => m.options.lineType?.toLowerCase()));
  const count = cluster.getChildCount();

  const color = types.size === 1
    ? typeColors[[...types][0]] || '#47A979'
    : '#47A979';

  const html = `
  <div style="
    background-color: white;
    border: 7px solid ${color};
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    color: ${color};
    box-shadow: 0 0 6px rgba(0,0,0,0.3);
  ">
    ${count}
  </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Create label icon for line length
function createLabelIcon(length, color) {
  return L.divIcon({
    html: `<div style="
      background-color: white;
      border: 3px solid ${color};
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      color: black;
      font-size: 12px;
    ">${length}m</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

// Component to handle map clicks, sending latlng to parent
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function MapView({ showForm, setShowForm, setSelectedPoints }) {
  const [spots, setSpots] = useState([]);
  const [selectedPoints, setLocalSelectedPoints] = useState([]);

  useEffect(() => {
    async function fetchSpots() {
      const { data, error } = await supabase.from('spots').select('*');
      if (error) {
        console.error('Error fetching spots:', error);
      } else {
        setSpots(data);
      }
    }
    fetchSpots();
  }, []);

  const [visibleTypes, setVisibleTypes] = useState({
    highline: true,
    waterline: true,
    parkline: true,
  });

  const [minLength, setMinLength] = useState('');
  const [maxLength, setMaxLength] = useState('');

  const navigate = useNavigate();

  const defaultCenter = [39.5, -98.35];
  const zoom = 4;

  // When local selectedPoints change, update parent state
  useEffect(() => {
    if (setSelectedPoints) {
      setSelectedPoints(selectedPoints);
    }
  }, [selectedPoints, setSelectedPoints]);

  // Handle map clicks: store max two points, restart after two
  const handleMapClick = (latlng) => {
    setLocalSelectedPoints(prev => {
      if (prev.length >= 2) {
        return [latlng]; // start over after two
      } else {
        return [...prev, latlng];
      }
    });
  };

return (
  <div className="flex flex-col lg:flex-row gap-4">
  {/* Filters Section */}
  <div className="w-full lg:w-1/6 flex flex-col gap-4 relative lg:justify-between">
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Filters</h2>

      {/* Type Filter Buttons */}
      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
        {Object.keys(typeColors).map((type) => (
          <button
            key={type}
            onClick={() =>
              setVisibleTypes((prev) => ({
                ...prev,
                [type]: !prev[type],
              }))
            }
            className={`px-3 py-1 rounded-sm font-medium transform transition duration-150 hover:scale-105`}
            style={{
              backgroundColor: 'white',
              color: 'black',
              border: visibleTypes[type]
                ? `2px solid ${typeColors[type]}`
                : '2px solid white',
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Length Filter */}
      <div className="flex flex-nowrap lg:flex-wrap gap-2 items-center">
        <label className="text-md font-medium text-black lg:w-full">Length:</label>
        <input
          type="number"
          placeholder="Min"
          value={minLength}
          onChange={(e) => setMinLength(e.target.value)}
          className="border px-2 py-1 rounded-sm w-16"
        />
        <span className="text-black">to</span>
        <input
          type="number"
          placeholder="Max"
          value={maxLength}
          onChange={(e) => setMaxLength(e.target.value)}
          className="border px-2 py-1 rounded-sm w-16"
        />
        <span className="text-black">meters</span>
      </div>
    </div>

    {/* Add Line Button for Large Screens */}
    {!showForm && (
      <button
        onClick={() => setShowForm(true)}
        className="hidden lg:block mt-4 bg-primary text-white px-4 py-2 rounded-sm shadow hover:bg-accent transition lg:mt-0"
      >
        + Add Line
      </button>
    )}
  </div>

  {/* Map Section */}
  <div className="h-[500px] w-full lg:w-5/6 rounded-sm shadow relative">
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={handleMapClick} />

      {/* Show temporary selected points */}
      {selectedPoints.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} />
      ))}

      <MarkerClusterGroup
        iconCreateFunction={createClusterIcon}
        chunkedLoading
      >
        {spots.map((spot) => {
          const lineType = spot.lineType?.toLowerCase();
          const color = typeColors[lineType] || '#47A979';

          if (!visibleTypes[lineType]) return null;
          if (minLength && spot.length < Number(minLength)) return null;
          if (maxLength && spot.length > Number(maxLength)) return null;

          return (
            <Marker
              key={spot.id}
              position={[spot.startLat, spot.startLng]}
              icon={createLabelIcon(spot.length, color)}
              lineType={lineType}
              eventHandlers={{
                click: () => navigate(`/line/${spot.id}`),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={1}
                permanent={false}
              >
                <div>
                  <strong>{spot.name}</strong>
                  <br />
                  Type: {spot.lineType}
                  <br />
                  Length: {spot.length} m
                  <br />
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>

    {/* Add Line Button for Small Screens */}
    {!showForm && (
      <button
  onClick={() => setShowForm(true)}
  className="absolute bottom-4 right-4 z-[9999] bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:bg-accent transition lg:hidden"
>
  + Add Line
</button>

    )}
  </div>
</div>
);
}





