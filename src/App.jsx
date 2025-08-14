import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import AddSpotForm from './components/AddSpotForm';
import MapView from './components/MapView';
import LineDetail from './components/LineDetail';
import supabase from './supabaseClient';
import 'leaflet/dist/leaflet.css';

// Reverse geocode helper
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return {
      country: data.address.country || 'Unknown Country',
      state: data.address.state || data.address.region || 'Unknown State/Province',
      city:
        data.address.city ||
        data.address.town ||
        data.address.village ||
        'Unknown City',
    };
  } catch (err) {
    console.error('Reverse geocoding failed:', err);
    return { country: 'Unknown Country', state: 'Unknown State/Province', city: 'Unknown City' };
  }
}

// Organize lines into { country: { state: { city: [lines] } } }
function organizeLines(lines) {
  const organized = {};
  lines.forEach((line) => {
    const { country, state, city } = line.locationData || {};
    if (!organized[country]) organized[country] = {};
    if (!organized[country][state]) organized[country][state] = {};
    if (!organized[country][state][city]) organized[country][state][city] = [];
    organized[country][state][city].push(line);
  });
  return organized;
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [lines, setLines] = useState([]); // all lines from Supabase
  const [organizedLines, setOrganizedLines] = useState({});

  const location = useLocation();
  const isLineDetailPage = location.pathname.startsWith('/line/');

  const startLat = selectedPoints[0]?.lat || '';
  const startLng = selectedPoints[0]?.lng || '';
  const endLat = selectedPoints[1]?.lat || '';
  const endLng = selectedPoints[1]?.lng || '';

  // Fetch lines from Supabase
  useEffect(() => {
    async function fetchLines() {
      try {
        const { data, error } = await supabase.from('spots').select('*');
        if (error) throw error;

        // Ensure every line has locationData
        const linesWithLocation = await Promise.all(
          data.map(async (line) => {
            if (!line.locationData || Object.keys(line.locationData).length === 0) {
              const locationData = await reverseGeocode(line.startLat, line.startLng);
              // Optionally update Supabase with locationData
              await supabase.from('spots').update({ locationData }).eq('id', line.id);
              return { ...line, locationData };
            }
            return line;
          })
        );

        setLines(linesWithLocation);
      } catch (err) {
        console.error('Error fetching lines:', err);
        // fallback: mock data
        const mockData = [
          {
            id: 1,
            name: 'Line One',
            startLat: 40.7608,
            startLng: -111.891,
            locationData: { country: 'USA', state: 'Utah', city: 'Salt Lake City' },
          },
          {
            id: 2,
            name: 'Line Two',
            startLat: 34.0522,
            startLng: -118.2437,
            locationData: { country: 'USA', state: 'California', city: 'Los Angeles' },
          },
        ];
        setLines(mockData);
      }
    }
    fetchLines();
  }, []);

  // Reorganize lines whenever they change
  useEffect(() => {
    setOrganizedLines(organizeLines(lines));
  }, [lines]);

  return (
    <>
      <header className="w-full bg-primary text-white p-4 shadow-md">
        <h1 className="text-3xl font-bold text-center">Highline Project is Live!</h1>
      </header>

      {isLineDetailPage ? (
        <Routes>
          <Route path="/line/:id" element={<LineDetail />} />
        </Routes>
      ) : (
        <div className="p-8 bg-secondary min-h-screen">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Map */}
            <div className="flex-1 relative">
              <MapView
                showForm={showForm}
                setShowForm={setShowForm}
                setSelectedPoints={setSelectedPoints}
              />
            </div>

            {/* Location List */}
            <div className="w-full lg:w-[400px] bg-white rounded p-4 overflow-y-auto">
              {Object.keys(organizedLines)
                .sort()
                .map((country) => (
                  <div key={country}>
                    <h2 className="font-bold text-lg">{country}</h2>
                    {Object.keys(organizedLines[country])
                      .sort()
                      .map((state) => (
                        <div key={state} className="ml-4">
                          <h3 className="font-semibold">{state}</h3>
                          {Object.keys(organizedLines[country][state])
                            .sort()
                            .map((city) => (
                              <div key={city} className="ml-4">
                                <h4 className="text-sm font-medium">{city}</h4>
                                <ul className="ml-4 list-disc">
                                  {organizedLines[country][state][city].map((line) => (
                                    <li key={line.id}>
                                      <Link
                                        to={`/line/${line.id}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {line.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                ))}
            </div>

            {/* Form */}
            {showForm && (
  <div className="w-full lg:w-[400px]">
    <AddSpotForm
      onClose={() => setShowForm(false)}
      startLat={startLat}
      startLng={startLng}
      endLat={endLat}
      endLng={endLng}
      setLines={setLines} // <-- Add this line
    />
  </div>
)}

          </div>
        </div>
      )}
    </>
  );
}

export default App;









