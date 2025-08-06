import React from 'react';
import AddSpotForm from './components/AddSpotForm';
import MapView from './components/MapView'; // 🧭 make sure this path is correct
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <div className="p-8 bg-primary min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-secondary text-center">
        Highline Project is Live!
      </h1>

      <AddSpotForm />

      <div className="mt-12">
        <MapView />
      </div>
    </div>
  );
}

export default App;

