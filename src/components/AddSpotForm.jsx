import React, { useState } from 'react';
import supabase from '../supabaseClient';



export default function AddSpotForm() {
  const [form, setForm] = useState({
  name: '',
  startLat: '',
  startLng: '',
  endLat: '',
  endLng: '',
  anchorType: '',
  lineType: '', // <-- new
  length: '',
  description: '',
  approach: '',
});


  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
  
    // Parse numeric fields
    const payload = {
      ...form,
      startLat: parseFloat(form.startLat) || null,
      startLng: parseFloat(form.startLng) || null,
      endLat: parseFloat(form.endLat) || null,
      endLng: parseFloat(form.endLng) || null,
      length: parseFloat(form.length) || null,
    };
  
    const { data, error } = await supabase.from('spots').insert([payload]);
  
    if (error) {
      console.error('Error inserting spot:', error);
      alert(`Error: ${error.message}`);
    
    } else {
      console.log('Spot submitted:', data);
      alert('Spot submitted successfully!');
      setForm({
        name: '',
        startLat: '',
        startLng: '',
        endLat: '',
        endLng: '',
        anchorType: '',
        length: '',
        description: '',
        approach: '',
      });
    }
  }
  
  

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-primary  text-primary rounded-md">
      <h2 className="text-xl font-semibold mb-4 text-secondary">Add a New Highline Spot</h2>

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
    <option value="highline">Highline</option>
    <option value="waterline">Waterline</option>
    <option value="slackline">Slackline</option>
  </select>
</label>

      <label className="block mb-2 text-secondary">
        Start Latitude:
        <input
          type="number"
          name="startLat"
          value={form.startLat}
          onChange={handleChange}
          step="any"
          required
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-2 text-secondary">
        Start Longitude:
        <input
          type="number"
          name="startLng"
          value={form.startLng}
          onChange={handleChange}
          step="any"
          required
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-2 text-secondary">
        End Latitude:
        <input
          type="number"
          name="endLat"
          value={form.endLat}
          onChange={handleChange}
          step="any"
          className="w-full p-2 border rounded text-primary"
        />
      </label>

      <label className="block mb-2 text-secondary">
        End Longitude:
        <input
          type="number"
          name="endLng"
          value={form.endLng}
          onChange={handleChange}
          step="any"
          className="w-full p-2 border rounded text-primary"
        />
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
        className="bg-accent text-white px-4 py-2 rounded hover:bg-green"
      >
        Submit Spot
      </button>
    </form>
  );
}
