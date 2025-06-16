'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import Image from 'next/image';

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [page] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const IMAGES_PER_PAGE = 12;
  const FOLDER_PATH = 'anamudi'; // path inside the 'gallery' bucket

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.storage
          .from('gallery')
          .list(FOLDER_PATH, {
            limit: IMAGES_PER_PAGE,
            offset: (page - 1) * IMAGES_PER_PAGE
          });

        if (error) {
          console.error('Error fetching images:', error);
          setError(`Supabase error: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          setError('No files found in folder');
          setImages([]);
          return;
        }

        const imageFiles = data.filter((file) =>
          file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i)
        );

        if (imageFiles.length === 0) {
          setError('No image files found');
          setImages([]);
          return;
        }

        const imageUrls = imageFiles.map((file) =>
          supabase.storage
            .from('gallery')
            .getPublicUrl(`${FOLDER_PATH}/${file.name}`).data.publicUrl
        );

        setImages(imageUrls);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [page]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-500 text-center">Gallery</h1>

      {loading && (
        <div className="text-white text-center py-8">Loading images...</div>
      )}

      {error && !loading && (
        <div className="text-red-400 text-center py-8">{error}</div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="text-white text-center py-8">No images found</div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative">
            <Image
              src={url}
              alt={`Image ${index}`}
              width={300}
              height={200}
              className="rounded-lg shadow-lg hover:scale-105 transition-transform w-full h-auto"
              onError={(e) => {
                console.error(`Failed to load image: ${url}`);
                e.currentTarget.style.border = '2px solid red';
              }}
              onLoad={() => {
                console.log(`Successfully loaded image: ${url}`);
              }}
            />
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
              {index + 1}
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
