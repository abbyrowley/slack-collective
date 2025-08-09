import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import AddSpotForm from './components/AddSpotForm';
import MapView from './components/MapView';
import LineDetail from './components/LineDetail';
import 'leaflet/dist/leaflet.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const location = useLocation();

  const isLineDetailPage = location.pathname.startsWith('/line/');

  return (
    <div className="p-8 bg-secondary min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-secondary text-center">
        Highline Project is Live!
      </h1>

      {/* Show map, button, and form only if not on line detail page */}
      {!isLineDetailPage && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            {/* Pass showForm and setShowForm to MapView if you want */}
            <MapView showForm={showForm} setShowForm={setShowForm} />

          </div>

          {/* Show the AddSpotForm when showForm is true */}
          {showForm && (
            <div className="w-full lg:w-[400px]">
              <AddSpotForm onClose={() => setShowForm(false)} />
            </div>
          )}
        </div>
      )}

      <Routes>
        {/* On the root path, map is already shown above, so no need to render */}
        <Route path="/" element={null} />
        <Route path="/line/:id" element={<LineDetail />} />
      </Routes>
    </div>
  );
}

export default App;


