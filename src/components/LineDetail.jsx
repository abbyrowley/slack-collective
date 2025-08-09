import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';



export default function LineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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

    if (id) {
      fetchLine();
      fetchPhotos();
    }
  }, [id]);

  async function handleUpload(event) {
    const files = event.target.files;
    if (!files.length) return;

    setUploading(true);

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;

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

    console.log("Public URL:", publicUrl);

    console.log("Inserting photo record with:", {
  spot_id: Number(id),
  image_url: publicUrl
});

      const { error: insertError } = await supabase
        .from('line_photos')
        .insert([{ spot_id: Number(id), image_url: publicUrl }]);

      if (insertError) {
        console.error('Insert error:', insertError);
      }
    }

    setUploading(false);
    await fetchPhotos();
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!line) return <div className="p-4">Line not found</div>;

return (
  <>
    {/* Full-width header */}
    <div className="bg-black text-white px-4 py-4 flex items-center justify-between w-full">
      <button
        onClick={() => navigate('/')}
        className="text-white hover:text-accent transition-colors duration-300"
      >
        ← Back to Map
      </button>
      <h1 className="text-3xl font-bold text-center flex-1">{line.name}</h1>
      <div className="w-[110px]">{/* Spacer for symmetry */}</div>
    </div>

    {/* Centered page content */}
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
        {photos.length > 0 ? (
          <div className="w-full sm:flex-1 px-2 sm:px-4 md:px-0">
  <Swiper
    modules={[Navigation, Pagination]}
    navigation
    pagination={{ clickable: true }}
    spaceBetween={5}
    slidesPerView={1}
    breakpoints={{
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    }}
    className="w-full"
  >
    {photos.map((photo) => (
      <SwiperSlide key={photo.id} className="flex items-center justify-center">
        <img
  src={photo.image_url}
  alt={`Photo ${photo.id} for ${line.name}`}
  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-300"
/>

      </SwiperSlide>
    ))}
  </Swiper>
</div>

        ) : (
          <div className="flex-1 p-4 border border-gray-300 text-center w-full">
            No photos available.
          </div>
        )}

      </div>
      {/* Upload Button */}
        <div className="w-full sm:w-auto">
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block bg-primary text-secondary font-semibold px-4 py-2 rounded-sm shadow hover:bg-accent transition-colors duration-300"
          >
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>

      <p className="mt-4 text-md font-bold text-gray-600 mb-2 capitalize">
        {line.lineType} | {line.length}m 
      </p>
     <div className="space-y-2 text-sm mb-8">
  <div className="flex">
    <span className="w-[7rem] font-semibold text-gray-700">Anchors:</span>
    <span>{line.anchorType}</span>
  </div>
  <div className="flex">
    <span className="w-[7rem] font-semibold text-gray-700">Tag:</span>
    <span>{line.tag}</span>
  </div>
  <div className="flex">
    <span className="w-[7rem] font-semibold text-gray-700">Established by:</span>
    <span>{line.established}</span>
  </div>
  <div className="flex">
    <span className="w-[7rem] font-semibold text-gray-700">FA:</span>
    <span>{line.firstAscent}</span>
  </div>
</div>
      <p className='text-xl font-bold underline decoration-accent'>Description</p>
      <p className='mb-4'>{line.description}</p>
      <p className='text-xl font-bold underline decoration-accent'>Approach</p>
      <p className='mb-4'>{line.approach}</p>
    </div>
  </>
);

}