import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Fix leaflet icon paths for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const typeColors = {
  highline: '#704786',
  waterline: '#18abc9',
  parkline: '#bfa33f',
};

function createClusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers();
  const types = new Set(markers.map(m => m.options.lineType?.toLowerCase()));
  const count = cluster.getChildCount();

  // Color is the type’s color if all same type; else gray
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


export default function MapView() {
  const [spots, setSpots] = useState([]);

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

  const defaultCenter = [39.5, -98.35];
  const zoom = 4;

  return (
    <div className="h-[500px] w-full rounded-md shadow">
      <MapContainer center={defaultCenter} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup iconCreateFunction={createClusterIcon} chunkedLoading>
          {spots.map((spot) => {
            const lineType = spot.lineType?.toLowerCase();
            const color = typeColors[lineType] || 'gray';

            return (
              <Marker
                key={spot.id}
                position={[spot.startLat, spot.startLng]}
                icon={createLabelIcon(spot.length, color)}
                lineType={lineType}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                  <div>
                    <strong>{spot.name}</strong><br />
                    Length: {spot.length} m<br />
                    Anchor: {spot.anchorType}<br />
                    {spot.description}
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
