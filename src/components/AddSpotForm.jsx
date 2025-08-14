import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

// Google reverse geocoding helper
async function reverseGeocode(lat, lng) {
  const API_KEY = 'AIzaSyBj1srff7buf9xMw4vlerYS6Qfs4S4Edvg'; // <-- Replace with your Google API key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('No results found');
    }

    const result = data.results[0];
    const components = result.address_components;

    const countryObj = components.find(c => c.types.includes('country'));
    const stateObj = components.find(c => c.types.includes('administrative_area_level_1'));
    const cityObj = components.find(c =>
      c.types.includes('locality') ||
      c.types.includes('postal_town') ||
      c.types.includes('sublocality')
    );

    return {
      country: countryObj?.long_name || 'Unknown Country',
      state: stateObj?.long_name || 'Unknown State/Province',
      city: cityObj?.long_name || 'Unknown City'
    };
  } catch (err) {
    console.error('Google reverse geocoding failed:', err);
    return {
      country: 'Unknown Country',
      state: 'Unknown State/Province',
      city: 'Unknown City'
    };
  }
}

export default function AddSpotForm({ onClose, startLat, startLng, endLat, endLng, setLines }) {
  const [form, setForm] = useState({
    name: '',
    startLat: '',
    startLng: '',
    endLat: '',
    endLng: '',
    anchorType: '',
    lineType: '',
    length: '',
    description: '',
    approach: '',
    tag: '',
    established: '',
    firstAscent: '',
  });

  // Sync form with map coordinates
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      startLat: startLat || '',
      startLng: startLng || '',
      endLat: endLat || '',
      endLng: endLng || '',
    }));
  }, [startLat, startLng, endLat, endLng]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.startLat || !form.startLng) {
      alert('Please select a location on the map.');
      return;
    }

    try {
      // Reverse geocode start coordinates using Google
      const locationData = await reverseGeocode(form.startLat, form.startLng);

      // Prepare payload for Supabase
      const payload = {
        ...form,
        startLat: parseFloat(form.startLat) || null,
        startLng: parseFloat(form.startLng) || null,
        endLat: parseFloat(form.endLat) || null,
        endLng: parseFloat(form.endLng) || null,
        length: parseFloat(form.length) || null,
        locationData,
      };

      // Insert into Supabase and get inserted row
      const { data, error } = await supabase.from('spots').insert([payload]).select();
      if (error) {
        console.error('Error inserting spot:', error);
        alert(`Error: ${error.message}`);
        return;
      }

      const newLine = data[0];

      // Update App's lines state immediately
      if (setLines) setLines((prev) => [...prev, newLine]);

      // Reset form and close
      setForm({
        name: '',
        startLat: '',
        startLng: '',
        endLat: '',
        endLng: '',
        anchorType: '',
        lineType: '',
        length: '',
        description: '',
        approach: '',
        tag: '',
        established: '',
        firstAscent: '',
      });

      if (onClose) onClose();
      alert('Spot submitted successfully!');
    } catch (err) {
      console.error('Failed to add new spot:', err);
      alert('Failed to add new spot. See console for details.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-primary text-primary rounded-sm shadow-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-secondary">Add a New Line</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white font-bold text-xl hover:text-accent transition"
          >
            ✕
          </button>
        )}
      </div>

      <label className="block mb-2 text-secondary">
        Name:
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      {/* Coordinates rows */}
      <div className="flex gap-4 mb-4">
        <label className="flex-1 text-gray-200 text-sm">
          Start Latitude:
          <input
            type="number"
            name="startLat"
            value={form.startLat}
            onChange={handleChange}
            step="any"
            required
            className="w-full p-1 border rounded text-primary text-sm"
          />
        </label>
        <label className="flex-1 text-gray-200 text-sm">
          Start Longitude:
          <input
            type="number"
            name="startLng"
            value={form.startLng}
            onChange={handleChange}
            step="any"
            required
            className="w-full p-1 border rounded text-primary text-sm"
          />
        </label>
      </div>
      <div className="flex gap-4 mb-4">
        <label className="flex-1 text-gray-200 text-sm">
          End Latitude:
          <input
            type="number"
            name="endLat"
            value={form.endLat}
            onChange={handleChange}
            step="any"
            className="w-full p-1 border rounded text-primary text-sm"
          />
        </label>
        <label className="flex-1 text-gray-200 text-sm">
          End Longitude:
          <input
            type="number"
            name="endLng"
            value={form.endLng}
            onChange={handleChange}
            step="any"
            className="w-full p-1 border rounded text-primary text-sm"
          />
        </label>
      </div>

      <label className="block mb-4 text-secondary">
        Line Type:
        <select
          name="lineType"
          value={form.lineType}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded text-primary"
        >
          <option value="">Select type</option>
          <option value="Highline">Highline</option>
          <option value="Waterline">Waterline</option>
          <option value="Parkline">Slackline</option>
        </select>
      </label>

      <label className="block mb-2 text-secondary">
        Line Length (meters):
        <input
          type="number"
          name="length"
          value={form.length}
          onChange={handleChange}
          required
          step="any"
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-2 text-secondary">
        Anchor Type:
        <input
          type="text"
          name="anchorType"
          value={form.anchorType}
          onChange={handleChange}
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-2 text-secondary">
        Tag:
        <input
          type="text"
          name="tag"
          value={form.tag}
          onChange={handleChange}
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-2 text-secondary">
        Established by:
        <input
          type="text"
          name="established"
          value={form.established}
          onChange={handleChange}
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-2 text-secondary">
        FA:
        <input
          type="text"
          name="firstAscent"
          value={form.firstAscent}
          onChange={handleChange}
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-4 text-secondary">
        Description:
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-4 text-secondary">
        Approach:
        <textarea
          name="approach"
          value={form.approach}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <button
        type="submit"
        className="bg-accent text-white px-4 py-2 rounded hover:bg-green transition-colors duration-300"
      >
        Submit Spot
      </button>
    </form>
  );
}





