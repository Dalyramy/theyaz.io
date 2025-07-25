import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Photo = Tables<'photos'>;

export default function PhotosData() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('photos')
          .select('*');

        if (error) {
          throw error;
        }

        setPhotos(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Photos Data</h1>
        <div className="text-gray-600">Loading photos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Photos Data</h1>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Photos Data</h1>
      <p className="text-gray-600 mb-6">
        This page demonstrates querying Supabase data from your React application.
        It selects all rows from the photos table and displays them below.
      </p>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Raw Data (JSON):</h2>
        <pre className="bg-white p-4 rounded border overflow-auto text-sm">
          {JSON.stringify(photos, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Photos Summary:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold">{photo.title}</h3>
              <p className="text-sm text-gray-600">{photo.caption}</p>
              <p className="text-xs text-gray-500 mt-2">
                ID: {photo.id}
              </p>
              <p className="text-xs text-gray-500">
                Created: {photo.created_at ? new Date(photo.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 