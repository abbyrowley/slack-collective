import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function LineDetail() {
  const { id } = useParams();
  const [line, setLine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function fetchPhotos() {
  const { data, error } = await supabase
    .from('line_photos')
    .select('*')
    .eq('spot_id', Number(id))
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching photos:', error);
  } else {
    setPhotos(data);
  }
}

useEffect(() => {
  async function fetchLine() {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching line:', error);
    } else {
      setLine(data);
    }

    setLoading(false);
  }

  async function fetchPhotos() {
  console.log("Fetching photos for spot_id:", id);

  const { data, error } = await supabase
    .from('line_photos')
    .select('*')
    .eq('spot_id', Number(id))  // <-- Convert if spot_id is integer
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching photos:', error);
  } else {
    console.log('Fetched photo rows:', data);
    setPhotos(data);
  }
}


  if (id) {
    fetchLine();
    fetchPhotos();
  }
}, [id]);


 async function handleUpload(event) {
  console.log("Uploading photos...");
  const files = event.target.files;
  if (!files.length) return;

  setUploading(true);

  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;
    console.log('Uploading file:', fileName);

    const { error: uploadError } = await supabase.storage
      .from('spot-photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue;
    }

    const { publicUrl } = supabase.storage
      .from('spot-photos')
      .getPublicUrl(fileName).data;

    console.log('Public URL:', publicUrl);

    const { data: insertData, error: insertError } = await supabase
  .from('line_photos')
  .insert([{ spot_id: Number(id), image_url: publicUrl }])
  .select(); // fetch the inserted row

if (insertError) {
  console.error('Insert error:', insertError);
} else {
  console.log('✅ Inserted row:', insertData);
}

  }

  setUploading(false);
  await fetchPhotos(); // Refresh photos without reload
}


  if (loading) return <div className="p-4">Loading...</div>;
  if (!line) return <div className="p-4">Line not found</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{line.name}</h1>
          <p className="text-sm text-gray-500 mb-2 capitalize">
            {line.lineType} • {line.length}m • {line.anchorType}
          </p>
          <p className="mb-4">{line.description}</p>

          <hr className="my-4" />

          <h2 className="text-lg font-semibold mb-2">Upload Photos</h2>
          <input
            type="file"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="mb-4"
          />
        </div>

        {/* Right Side: Photos */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {photos.length === 0 && <p>No photos available.</p>}
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.image_url}
              alt={`Photo ${photo.id} for ${line.name}`}
              className="w-full h-auto object-cover rounded shadow"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
